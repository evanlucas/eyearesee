'use strict'

const debug = require('debug')('eyearesee:handlers:message')

module.exports = function handleMessage(msg, type, conn) {
  debug('handleMessage', type, msg)
  const to = msg.to
  const from = msg.from.toLowerCase()
  const channel = to.toLowerCase()
  const nick = conn.user.nickname.toLowerCase()

  let chan
  if (conn.channels.has(channel)) {
    chan = conn.channels.get(channel)
  } else if (channel === nick) {
    // if the channel (private message in this case) already exists,
    // it is simply returned here.
    chan = conn.addPrivateMessage({
      name: msg.from
    , topic: `Conversation with ${msg.from}`
    , nick: nick
    , unread: 0
    , messages: []
    })
  }

  if (!chan) {
    debug('unable to find channel', msg)
    return
  }

  if (~msg.message.indexOf(nick))
    type = 'mention'

  const sub = msg.message.substring(0, 7)
  if (sub === '\u0001ACTION') {
    type = 'action'
    msg.message = msg.message.substring(8)
  }

  chan.addMessage({
    message: msg.message
  , type: type
  , to: to
  , from: msg.from
  , hostmask: msg.hostmask
  })

  chan.unread++

  if (!chan.isActive()) {
    conn.app.setBadge()
  }
  conn.render()
}
