'use strict'

const debug = require('debug')('eyearesee:handlers:quit')

module.exports = function handleQuit(msg, conn) {
  // nick, hostmask, message
  const nick = msg.nick
  if (!nick) {
    debug('no nick???', msg, msg.nick)
    return
  }

  if (nick = conn.user.nickname) {
    // it's me
    debug('I QUIT', msg)
  } else {
    for (const chan of conn.channels.values()) {
      chan.removeUser(nick)
    }
  }
}
