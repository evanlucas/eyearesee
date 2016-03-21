'use strict'

const debug = require('debug')('eyearesee:handlers:invite')

module.exports = function handleInvite(msg, conn) {
  debug('invite', msg)

  if (msg.to === conn.user.nickname) {
    conn.log({
      type: 'invite'
    , message: `${msg.from} has invited you to join ${msg.channel}`
    , from: null
    , ts: new Date()
    , channel: msg.channel
    })

    if (conn.app.settings.get('autoAcceptInvites')) {
      // auto join
      conn.join([msg.channel])
    } else {
      new Notification(`Invitation from ${msg.from}`, {
        body: `You have been invited to join ${msg.channel}`
      })
    }
  }
}
