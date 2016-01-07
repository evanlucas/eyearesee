'use strict'

const debug = require('debug')('eyearesee:handlers:names')

module.exports = function handleNames(msg, conn) {
  debug('names %s', msg.channel)
  const names = msg.names
  const channel = (msg.channel || '').toLowerCase()

  const chan = conn.channels.get(channel)
  if (!chan) {
    debug('no channel? wtf', msg)
    return
  }

  for (var i = 0; i < names.length; i++) {
    const u = names[i]
    const opts = {
      nickname: u.name
    , mode: u.mode
    }
    chan._addUser(opts)
  }

  chan.setNames()
  conn.render()
}
