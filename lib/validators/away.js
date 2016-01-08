'use strict'

module.exports = function away(parts) {
  // /away [text]
  return {
    type: 'away'
  , message: parts.length ? parts.join(' ') : null
  }
}
