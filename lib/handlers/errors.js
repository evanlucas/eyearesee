'use strict'

module.exports = function handleErrors(msg, conn) {
  const title = msg.cmd

  conn.log({
    type: 'error'
  , from: ''
  , channel: msg.channel || ''
  , message: msg.message
  , ts: new Date()
  })
}
