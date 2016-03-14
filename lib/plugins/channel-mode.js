'use strict'

module.exports = function channelMode(irc) {
  const client = irc.client

  client.on('data', (msg) => {
    if (msg.command === 'RPL_CHANNELMODEIS') {
      const params = msg.params.split(' ')
      const out = {
        mode: params[2]
      , channel: params[1]
      }

      irc.emit('channel_mode', out)
    }
  })
}
