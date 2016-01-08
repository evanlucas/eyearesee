'use strict'

module.exports = function mode(parts) {
  // /mode target, flags[, params]
  if (parts.length < 2)
    return null

  const out = {
    type: 'mode'
  , target: parts[0].toLowerCase()
  , flags: parts[1]
  , params: ''
  }

  if (parts.length === 3) {
    out.params = parts[2]
  }

  return out
}
