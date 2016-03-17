'use strict'

const argsplit = require('argsplit')

module.exports = function parse(msg) {
  const parts = argsplit(msg)
  let cmd = parts[0]

  if (!cmd) return

  if (cmd[0] !== '/' || (cmd[0] === '/' && cmd[1] === '/')) {
    // it is just a message for the current selected window
    // so either to the channel or to a user in a private message
    //
    // or it is a js style comment type
    return {
      type: '_message'
    , data: msg
    }
  }

  const type = parts.shift().slice(1)
  return {
    type: type
  , data: msg.slice(type.length + 2)
  }
}
