'use strict'

module.exports = function notice(parts) {
  if (parts.length < 2)
    return

  return {
    type: 'notice'
  , target: parts.shift().toLowerCase()
  , message: parts.join(' ')
  }
}
