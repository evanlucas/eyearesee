'use strict'

module.exports = function whois(parts) {
  // whois [target] <mask>

  if (parts.length < 1)
    return null

  const out = {
    type: 'whois'
  , target: null
  , mask: ''
  }

  if (parts.length === 1) {
    out.mask = parts[0]
  } else if (parts.length === 2) {
    out.target = parts.shift()
    out.mask = parts.join(' ')
  }

  return out
}
