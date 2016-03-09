'use strict'

const debug = require('debug')('eyearesee:handlers:part')

module.exports = function handlePart(msg, conn) {
  const nick = msg.nick
  if (!nick) {
    debug('no nick???', msg, msg.nick)
    return
  }

  const channels = msg.channels.map((m) => m.toLowerCase())
  for (var i = 0; i < channels.length; i++) {
    const channel = channels[i].toLowerCase()
    if (!conn.channels.has(channel)) {
      debug('cannot find channel %s', channel)
      continue
    }

    const chan = conn.channels.get(channel)

    if (nick === conn.user.nickname) {
      debug('I PARTED from %s', channel)
      // Just mark the channel as not joined
      // The user can remove it from UI at his or her option
      chan.joined = false
      conn.render()
    } else {
      debug('%s parted from %s', nick, channel)
      chan.removeUser(nick)
    }
  }
}
