'use strict'

const debug = require('debug')('eyearesee:handle-input')
const Connection = require('./models/connection')
const Channel = require('./models/channel')

module.exports = Handler

function Handler(app) {
  if (!(this instanceof Handler))
    return new Handler(app)

  this.app = app
  this.nav = app.nav

  this.app.on('command', (msg) => {
    this.handle(msg)
  })
}

Handler.prototype._message = function _message(msg) {
  const active = this.nav.current
  if (active instanceof Connection)
    return

  if (active instanceof Channel) {
    active.send(msg.data)
    if (active.isActive()) {
      active._connection.render()
    }
  }
}

Handler.prototype.join = function join(msg) {
  const active = this.nav.current
  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }

  if (conn) {
    conn.join(msg.channels, msg.keys)
  } else {
    debug('invalid connection to join', active)
  }
}

Handler.prototype.nick = function nick(msg) {
  const active = this.nav.current
  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }

  if (conn) {
    conn.irc.nick(msg.nick)
  } else {
    debug('invalid connection to nick', active)
  }
}

Handler.prototype.leave = function leave(msg) {
  const active = this.nav.current

  if (!msg.channels.length)
    return

  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }

  if (conn) {
    conn.part(msg.channels, msg.message)
  } else {
    debug('invalid connection to part', active, msg)
  }
}

Handler.prototype.part = Handler.prototype.leave

Handler.prototype.whois = function whois(msg) {
  const active = this.nav.current
  debug('whois', msg)
  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }

  if (conn) {
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
  const active = this.nav.current

  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }
  if (conn) {
    conn.irc.away(msg.message)
  } else {
    debug('invalid connection to away', active, msg)
  }
}

Handler.prototype.msg = function(msg) {
  debug('private message', msg)
  const active = this.nav.current

  var conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  }

  if (conn) {
    const chan = conn.addPrivateMessage({
      name: msg.target
    , topic: `Conversation with ${msg.target}`
    , nick: conn.user.nickname
    , messages: []
    , unread: 0
    })

    chan.send(msg.message)
  }
}

Handler.prototype.handle = function handle(msg) {
  const active = this.nav.current
  if (!active) return
  if (this[msg.type]) {
    this[msg.type](msg)
  } else {
    // unknown
    debug('unknown type', msg)
  }
}
