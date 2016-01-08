'use strict'

module.exports = function who(parts) {
  // /who [mask[, "o"]]

  if (parts.length < 1)
    return null

  return {
    type: 'who'
  , mask: parts[0]
  , o: (parts.length > 1 && parts[1] === 'o') ? 'o' : null
  }
}
