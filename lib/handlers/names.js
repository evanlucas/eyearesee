'use strict'

const debug = require('debug')('eyearesee:handlers:names')

module.exports = function handleNames(msg, app) {
  debug('names %s', msg.channel)
  const names = msg.names
  const channel = (msg.channel || '').toLowerCase()
  if (!channel) {
    debug('no channel? wtf', msg)
    return
  }

  const chan = app.data.channels[channel]
  chan.setNames(names)
  app.emit('render')
}
