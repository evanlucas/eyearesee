'use strict'

module.exports = function msg(parts) {
  if (parts.length < 2)
    return

  return {
    type: 'msg'
  , target: parts.shift().toLowerCase()
  , message: parts.join(' ')
  }
}
