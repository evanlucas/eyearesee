'use strict'

const argsplit = require('argsplit')

module.exports = function parse(msg) {
  const parts = argsplit(msg)
  const cmd = parts[0]

  if (!cmd) return

  if (cmd[0] !== '/') {
    // it is just a message for the current selected window
    // so either to the channel or to a user in a private message
    return {
      type: '_message'
    , data: msg
    }
  }

  if (cmd === '/msg') {
    parts.shift()
    return {
      type: 'msg'
    , data: parts.join(' ')
    }
  }

  return {
    type: parts.shift().slice(1)
  , data: parts
  }
}
