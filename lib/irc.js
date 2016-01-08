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

  this._setupClient()
}
inherits(IRC, EE)

IRC.prototype._setupClient = function _setupClient() {
  const serverOpts = this.opts.server
  this.stream = net.connect({
    port: serverOpts.port
  , host: serverOpts.host
  })

  this.stream.on('connect', () => {
    this.client.write('CAP LS')
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

  this.client.user(opts.username, opts.realname)

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

  var acks = 0

  this.client.on('data', (msg) => {
    debug('data', msg)
    if (msg.command === '903') {
      debug('writing CAP stuff')
      this.client.write('CAP REQ identify-msg')
      this.client.write('CAP REQ multi-prefix')
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

    } else if (msg.command === 'CAP') {
      const sub = msg.params.split(' ')[1]
      if (sub === 'LS') {
        const exts = msg.trailing.split(' ')
        debug('CAP LS', exts)
        if (~exts.indexOf('sasl')) {
          debug('enabling sasl')
          this.client.write('CAP REQ sasl')
        } else {
          // sasl is disabled...
          // just straight up authenticate
          if (opts.password) {
            this.client.pass(opts.password)
          }

          this.client.nick(opts.nickname)
        }
        this.emit('CAP_LS', {
          extensions: exts
        })
      } else if (sub === 'ACK') {
        acks++
        if (acks === 3) {
          this.client.write('CAP END')
          this.client.nick(opts.nickname)
        }
        debug('CAP ACK')
        if (msg.trailing === 'sasl') {
          this.client.write('AUTHENTICATE PLAIN')
        }
        this.emit('CAP_ACK', {
          extension: msg.trailing
        })
      } else if (sub === 'NAK') {
        this.emit('CAP_NAK', {
          extension: msg.trailing
        })
      }
    } else if (msg.command === 'AUTHENTICATE') {
      const nick = opts.nickname
      const u = opts.username
      const p = opts.password || ''
      const buf = Buffer(`${nick}\0${u}\0${p}`).toString('base64')
      this.client.write(`AUTHENTICATE ${buf}`)
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
  this.client.nick(nick)
}

IRC.prototype.invite = function invite(name, channel) {
  this.client.invite(name, channel)
}

IRC.prototype.send = function send(target, msg) {
  this.client.send(target, msg)

  // TODO(evanlucas) if this is a user,
  // check that the user has a private window created
}

IRC.prototype.action = function action(target, msg) {
  this.client.action(target, msg)
}

IRC.prototype.notice = function notice(target, msg) {
  this.client.notice(target, msg)
}

IRC.prototype.join = function join(channel) {
  this.client.join(channel)
  // TODO(evanlucas) add channel to the db
}

IRC.prototype.part = function part(channel, msg) {
  this.client.part(channel, msg)
}

IRC.prototype.names = function names(channel, cb) {
  this.client.names(channel, cb)
}

IRC.prototype.away = function away(msg) {
  if (msg) {
    this.client.write(`AWAY :${msg}`)
  } else {
    this.client.write('AWAY')
  }
}

IRC.prototype.topic = function topic(channel, top) {
  this.client.topic(channel, top)
}

IRC.prototype.kick = function kick(channels, nicks, msg) {
  this.client.kick(channels, nicks, msg)
}

IRC.prototype.oper = function oper(name, password) {
  this.client.oper(name, password)
}

IRC.prototype.mode = function mode(target, flags, params) {
  this.client.mode(target, flags, params)
}

IRC.prototype.quit = function quit(msg) {
  this.client.quit(msg)
}

IRC.prototype.whois = function whois(target, mask, cb) {
  this.client.whois(target, mask, cb)
}
