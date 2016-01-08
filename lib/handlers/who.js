'use strict'

const debug = require('debug')('eyearesee:handlers:who')

module.exports = function handleWho(channel, msg, conn) {
  const chan = conn.channels.get(channel)
  if (!chan) {
    debug('cannot find channel %s', channel)
    return
  }

  chan.addOrUpdateUser(msg)
}
