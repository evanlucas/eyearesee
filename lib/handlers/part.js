'use strict'

const debug = require('debug')('eyearesee:handlers:part')

module.exports = function handlePart(msg, app) {
  const nick = msg.nick
  if (!nick) {
    debug('no nick???', msg, msg.nick)
    return
  }

  const channels = msg.channels.map((m) => m.toLowerCase())
  for (var i = 0; i < channels.length; i++) {
    const channel = channels[i]
    debug('channel %s', channel)
    const chan = app.data.channels[channel]
    if (!chan) {
      debug('cannot find channel %s', channel, app.data.channels)
      continue
    }
    if (nick === app.data.user.nickname) {
      // it's me
      debug('I PARTED FROM %s', channel)
    } else {
      debug('%s parted from %s', nick, channel)
      chan.removeUser(nick)
      app.emit('render')
    }
  }
}
