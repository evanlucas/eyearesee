'use strict'

module.exports = function invite(parts) {
  // /invite <nick> <channel>

  if (parts.length < 2)
    return null

  return {
    type: 'invite'
  , channel: parts[1].toLowerCase()
  , nick: parts[0].toLowerCase()
  }
}
