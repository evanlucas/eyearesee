'use strict'

module.exports = function awayHelper(irc) {
  const client = irc.client
  client.on('data', (msg) => {
    if (msg.command === 'RPL_UNAWAY' || msg.command === 'RPL_NOWAWAY') {
      const type = msg.command === 'RPL_UNAWAY'
        ? 'unaway'
        : 'away'

      irc.emit('log', {
        type: type
      , from: ''
      , message: msg.trailing
      , ts: new Date()
      , hostmask: null
      , channel: null
      })
    }
  })
}
