'use strict'

module.exports = function handleErrors(msg, app) {
  const title = msg.cmd

  app.log({
    type: 'error'
  , message: msg.message
  , ts: new Date()
  })
}
