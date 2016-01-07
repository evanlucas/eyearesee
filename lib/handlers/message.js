'use strict'

const debug = require('debug')('eyearesee:handlers:message')

module.exports = function handleMessage(msg, conn) {
  const to = msg.to
  const from = msg.from

  const channel = to.toLowerCase()
  if (conn.channels.has(channel)) {
    debug('we have the channel')
    const chan = conn.channels.get(channel)
    let type = 'message'
    if (~msg.message.indexOf(conn.user.nickname))
      type = 'mention'
    chan.addMessage({
      message: msg.message
    , type: type
    , to: to
    , from: from
    , hostmask: msg.hostmask
    })

    const current = conn.app.nav.current
    if (current && current.name === channel) {
      debug('current window')
      conn.render()
    } else {
      debug('not current window', channel, msg)
      if (~msg.message.indexOf(conn.user.nickname)) {
        this.setBadge()
      }
    }
  } else {
    debug('not a channel message', msg)
  }
}
