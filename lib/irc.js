'use strict'

const irc = require('slate-irc')
const net = require('net')
const inherits = require('util').inherits
const EE = require('events')
const debug = require('debug')('eyearesee:irc')

module.exports = IRC

function IRC(opts) {
  if (!(this instanceof IRC))
    return new IRC(opts)

  EE.call(this)
  debug('irc opts %o', opts)
  this.opts = opts
  this.client = null
  this.stream = null

  this.connected = false
}
inherits(IRC, EE)

IRC.prototype.connect = function connect() {
  this._setupClient()
}

IRC.prototype.disconnect = function disconnect(cb) {
  this.stream.removeAllListeners('close')
  this.stream.once('end', () => {
    this.connected = false
    this.emit('disconnected')
    if (this.client)
      this.client = null

    cb && cb()
  })
  this.stream.end()
}

IRC.prototype._setupClient = function _setupClient() {
  const serverOpts = this.opts.server
  this.stream = net.connect({
    port: serverOpts.port
  , host: serverOpts.host
  })

  this.stream.on('connect', () => {
    this.connected = true
    this.emit('connect')
  })

  this.stream.on('close', () => {
    console.warn('socket closed...reconnecting')
    this.stream.removeAllListeners()
    this.client.removeAllListeners()
    setTimeout(() => {
      this._setupClient()
    }, 5000)
  })

  this.client = irc(this.stream)
  const opts = this.opts.user

  if (opts.password) {
    this.client.pass(opts.password)
  }
  this.client.user(opts.username, opts.realname)

  this.client.nick(opts.nickname)

  this.client.on('notice', (msg) => {
    this.emit('notice', msg)
    this.emit('log', {
      type: 'notice'
    , from: msg.from
    , message: msg.message
    , ts: new Date()
    , hostmask: msg.hostmask
    , channel: msg.to // can be a channel or a username or nothing
    })
  })

  this.client.on('welcome', (msg) => {
    this.emit('welcome', msg)
    this.emit('log', {
      type: 'welcome'
    , from: ''
    , message: `Welcome ${msg}`
    , ts: new Date()
    , hostmask: null
    , channel: null
    })
  })

  this.client.on('motd', (msg) => {
    this.emit('motd', msg.motd)
    const len = msg.motd.length
    for (var i = 0; i < len; i++) {
      this.emit('log', {
        type: 'motd'
      , from: ''
      , message: msg.motd[i]
      , ts: new Date()
      , hostmask: null
      , channel: null
      })
    }
  })

  this.client.on('join', (msg) => {
    this.emit('join', msg)
  })

  this.client.on('errors', (msg) => {
    this.emit('errors', msg)
  })

  this.client.on('nick', (msg) => {
    debug('nick', msg)
    if (msg.nick === this.client.me) {
      // this is us
      // emit event
      this.emit('userNickChanged', msg.new)
    }
    this.emit('nick', msg)
  })

  this.client.on('topic', (msg) => {
    this.emit('topic', msg)
    this.emit('log', {
      type: 'topic'
    , from: ''
    , message: msg.topic
    , ts: new Date()
    , hostmask: null
    , channel: msg.channel
    })
  })

  this.client.on('names', (msg) => {
    this.emit('names', msg)
  })

  this.client.on('mode', (msg) => {
    debug('mode', msg)
    this.emit('mode', msg)
  })

  this.client.on('message', (msg) => {
    debug('message', msg)
    this.emit('message', msg)
  })

  this.client.on('part', (msg) => {
    this.emit('part', msg)
  })

  this.client.on('quit', (msg) => {
    this.emit('quit', msg)
  })

  this.client.on('whois', (msg) => {
    debug('WHOIS', msg)
  })

  this.client.on('data', (msg) => {
    debug('data', msg)
    if (msg.command === 'RPL_UNAWAY') {
      this.emit('log', {
        type: 'unaway'
      , from: ''
      , message: msg.trailing
      , ts: new Date()
      , hostmask: null
      , channel: null
      })
    } else if (msg.command === 'RPL_NOWAWAY') {
      this.emit('log', {
        type: 'away'
      , from: ''
      , message: msg.trailing
      , ts: new Date()
      , hostmask: null
      , channel: null
      })
    } else if (msg.command === 'ERROR') {
      this.emit('ircerror', {
        message: msg.string
      , cmd: 'error'
      })
    } else if (msg.command === 'ERR_NICKNAMEINUSE') {
      const oldNick = msg.params.split(' ')[1]
      debug('nickname already in use %s', oldNick)
      if (oldNick === opts.nickname) {
        // original nickname failed
        // if opts.altnick exists, try using it
        if (opts.altnick && opts.altnick !== opts.nickname) {
          debug('trying altnick %s', opts.altnick)
          this.client.nick(opts.altnick)
        } else {
          debug('no altnick configured', opts)
        }
      } else {
        // alt nick failed
        // try appending something to the original nick
        let newNick = oldNick
        const newChar = String.fromCharCode(newNick[newNick.length - 1] + 1)
        newNick[newNick.length - 1] = newChar
        debug('oldNick %s newNick %s', oldNick, newNick)
        this.client.nick(newNick)
      }
    } else if (msg.command === 'RPL_ISUPPORT') {

    } else if (msg.command === 'RPL_WHOREPLY') {
      const params = msg.params.split(' ')
      const channel = params[1].toLowerCase()
      const nick = (params[5] || '').toLowerCase()
      const u = (params[2] || '').toLowerCase()
      const rn = msg.trailing.split(' ')
      rn.shift()
      const opts = {
        nickname: nick
      , username: u
      , address: params[3]
      , realname: rn.join(' ')
      , mode: (params[6] || '').replace(/H|G/, '')
      , hostmask: {
          nick: nick
        , username: u
        , hostname: params[3]
        , string: msg.prefix
        }
      }
      this.emit('who', channel, opts)
    } else if (msg.command === 'RPL_ENDOFWHO') {
      const channel = msg.params.split(' ')[1]
      this.emit('who_end', channel)
    }
  })
}

IRC.prototype.nick = function nick(nick) {
  if (!this.connected) {
    this.once('connect', () => {
      this.nick(nick)
    })
    return
  }

  this.client.nick(nick)
}

IRC.prototype.invite = function invite(name, channel) {
  if (!this.connected) {
    this.once('connect', () => {
      this.invite(name, channel)
    })
    return
  }
  this.client.invite(name, channel)
}

IRC.prototype.send = function send(target, msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.send(target, msg)
    })
    return
  }
  this.client.send(target, msg)
}

IRC.prototype.action = function action(target, msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.action(target, msg)
    })
    return
  }
  this.client.action(target, msg)
}

IRC.prototype.notice = function notice(target, msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.notice(target, msg)
    })
    return
  }
  this.client.notice(target, msg)
}

IRC.prototype.join = function join(channel) {
  if (!this.connected) {
    this.once('connect', () => {
      this.join(channel)
    })
    return
  }
  this.client.join(channel)
}

IRC.prototype.part = function part(channel, msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.part(channel, msg)
    })
    return
  }
  this.client.part(channel, msg)
}

IRC.prototype.names = function names(channel, cb) {
  if (!this.connected) {
    this.once('connect', () => {
      this.names(channel, cb)
    })
    return
  }
  this.client.names(channel, cb)
}

IRC.prototype.away = function away(msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.away(msg)
    })
    return
  }
  if (msg) {
    this.client.write(`AWAY :${msg}`)
  } else {
    this.client.write('AWAY')
  }
}

IRC.prototype.topic = function topic(channel, top) {
  if (!this.connected) {
    this.once('connect', () => {
      this.topic(channel, top)
    })
    return
  }
  this.client.topic(channel, top)
}

IRC.prototype.kick = function kick(channels, nicks, msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.kick(channels, nicks, msg)
    })
    return
  }
  this.client.kick(channels, nicks, msg)
}

IRC.prototype.oper = function oper(name, password) {
  if (!this.connected) {
    this.once('connect', () => {
      this.oper(name, password)
    })
    return
  }
  this.client.oper(name, password)
}

IRC.prototype.mode = function mode(target, flags, params) {
  if (!this.connected) {
    this.once('connect', () => {
      this.mode(target, flags, params)
    })
    return
  }
  this.client.mode(target, flags, params)
}

IRC.prototype.quit = function quit(msg) {
  if (!this.connected) {
    this.once('connect', () => {
      this.quit(msg)
    })
    return
  }
  this.client.quit(msg)
}

IRC.prototype.whois = function whois(target, mask, cb) {
  if (!this.connected) {
    this.once('connect', () => {
      this.whois(target, mask, cb)
    })
    return
  }
  this.client.whois(target, mask, cb)
}
