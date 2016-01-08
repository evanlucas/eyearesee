'use strict'

const argsplit = require('argsplit')
const validators = require('./validators')

module.exports = function parse(msg) {
  const parts = argsplit(msg)
  let cmd = parts[0]

  if (!cmd) return

  if (cmd[0] !== '/') {
    // it is just a message for the current selected window
    // so either to the channel or to a user in a private message
    return {
      type: '_message'
    , data: msg
    }
  }

  cmd = cmd.slice(1).toLowerCase()
  if (validators[cmd]) {
    parts.shift()
    return validators[cmd](parts)
  }

  return {
    type: parts.shift().slice(1)
  , data: parts
  }
}
