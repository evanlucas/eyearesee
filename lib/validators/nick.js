'use strict'

module.exports = function nick(parts) {
  if (parts.length < 1)
    return null

  return {
    type: 'nick'
  , nick: parts[0]
  }
}
