'use strict'

const debug = require('debug')('eyearesee:handle-input')
const IRC = require('eyearesee-client')
const Connection = IRC.Connection
const Channel = IRC.Channel
const utils = require('./utils')

module.exports = Handler

function Handler(app) {
  if (!(this instanceof Handler))
    return new Handler(app)

  this.app = app

  this.app.on('command', (msg) => {
    this.handle(msg)
  })
}

Handler.prototype._message = function _message(msg) {
  const active = this.app.activeModel
  if (active instanceof Connection)
    return

  if (active instanceof Channel) {
    active.send(msg.data)
    if (this.app.isActive(active)) {
      this.app.needsLayout()
    }
  }
}

Handler.prototype.action = function action(msg) {
  const active = this.app.activeModel
  if (active instanceof Connection)
    return

  if (active instanceof Channel) {
    active.action(msg.data)
    if (this.app.isActive(active)) {
      this.app.needsLayout()
    }
  }
}

Handler.prototype.list = function list(msg) {
  const conn = this.app.getActiveConnection()
  if (conn)
    conn.list(msg.data)
}

Handler.prototype.me = Handler.prototype.action

Handler.prototype.join = function join(msg) {
  if (!msg.chan) {
    debug('missing channel', msg)
    return
  }

  if (!msg.conn) {
    debug('missing connection', msg)
    return
  }

  const conn = msg.conn
  conn.write(`JOIN ${msg.chan}`)
}

Handler.prototype.nick = function nick(msg) {
  const active = this.app.activeModel

  var conn = active && active.getConnection
    ? active.getConnection()
    : null

  if (conn) {
    conn.write(`NICK ${msg.data}`)
  } else {
    debug('invalid connection to nick', active)
  }
}

Handler.prototype.leave = function leave(msg) {
  if (!msg.chan) {
    debug('missing channel', msg)
    return
  }

  if (!msg.conn) {
    debug('missing connection', msg)
    return
  }

  const def = msg.conn.settings.get('part.message')

  const m = msg.data
    ? ` :${msg.data}`
    : ` :${def}`

  const conn = msg.conn
  conn.write(`PART ${msg.chan}${m}`)
}

Handler.prototype.part = Handler.prototype.leave

Handler.prototype.whois = function whois(msg) {
  const active = this.app.activeModel
  debug('whois', msg)
  var conn = active.getConnection
    ? active.getConnection()
    : null


  if (conn) {
    // FIXME
    if (msg.target) {
      conn.whois(msg.target, msg.mask)
    } else {
      conn.whois(msg.mask)
    }
  } else {
    debug('invalid whois', active, msg)
  }
}

Handler.prototype.away = function away(msg) {
  const active = this.app.activeModel

  var conn = active.getConnection
    ? active.getConnection()
    : null

  if (conn) {
    // FIXME
    conn.irc.away(msg.data)
  } else {
    debug('invalid connection to away', active, msg)
  }
}

Handler.prototype.topic = function topic(msg) {
  if (!msg.chan) {
    debug('missing channel', msg)
    return
  }

  if (!msg.conn) {
    debug('missing connection', msg)
    return
  }

  const conn = msg.conn

  if (msg.data) {
    conn.write(`TOPIC ${msg.chan} :${msg.data}`)
  } else {
    conn.write(`TOPIC ${msg.chan}`)
  }
}

Handler.prototype.mode = function mode(msg) {
  if (!msg.chan) {
    debug('missing channel', msg)
    return
  }

  if (!msg.conn) {
    debug('missing connection', msg)
    return
  }

  const conn = msg.conn
  conn.write(`MODE ${msg.chan} ${msg.data}`)
}

Handler.prototype.quit = function quit(msg) {
  const active = this.app.activeModel

  var conn = active.getConnection
    ? active.getConnection()
    : null

  if (conn) {
    const m = msg.data || 'Bye!'
    conn.write(`QUIT :${m}`)
  }
}

Handler.prototype.invite = function invite(msg) {
  if (!msg.chan) {
    debug('missing channel', msg)
    return
  }

  if (!msg.conn) {
    debug('missing connection', msg)
    return
  }

  debug('invite %s', msg.data)

  const conn = msg.conn
  conn.write(`INVITE ${msg.data}`)
}

Handler.prototype.msg = function(msg) {
  debug('private message', msg)
  const active = this.app.activeModel

  var conn = active.getConnection
    ? active.getConnection()
    : null

  if (conn) {
    const splits = msg.data.split(' ')
    const name = splits[0]
    if (!name) return

    splits.shift()

    const chan = conn.addQuery({
      name: name
    , topic: `Conversation with ${name}`
    , nick: conn.user.nickname
    , messages: []
    , unread: 0
    })

    chan.send(splits.join(' '))
  }
}

const needTypes = [
  'join'
, 'part'
, 'leave'
, 'topic'
, 'mode'
, 'invite'
]

Handler.prototype.fixupIfNeeded = function fixupIfNeeded(msg) {
  if (!~needTypes.indexOf(msg.type)) {
    return
  }

  const active = this.app.activeModel
  var conn = active.getConnection
    ? active.getConnection()
    : null

  var chan

  if (active instanceof Channel) {
    chan = active
  }

  msg.conn = conn
  msg.chan = chan

  if (conn) {
    if (msg.data) {
      msg.data = msg.data.trim()
    }
    let m = msg.data || ''
    m = m.split(' ')
    const cn = m.shift()
    if (!utils.isValidChannel(cn) && chan) {
      debug('invalid channel %s %s', cn, msg.data)
      msg.chan = chan.name
      debug('fallback to %s', chan.name)
    } else {
      msg.chan = cn
      msg.data = m.join(' ')
    }
  }
}

Handler.prototype.handle = function handle(msg) {
  const active = this.app.activeModel
  if (!active) return

  this.fixupIfNeeded(msg)

  if (this[msg.type]) {
    this[msg.type](msg)
  } else {
    // unknown
    debug('unknown type', msg)
  }
}
