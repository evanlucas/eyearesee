'use strict'

module.exports = function action(parts) {
  // /me <text>

  if (!parts.length)
    return null

  return {
    type: 'action'
  , message: parts.join(' ')
  }
}
