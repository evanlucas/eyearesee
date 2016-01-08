'use strict'

module.exports = function topic(parts) {
  // /topic channel[, topic]

  if (parts.length < 1)
    return null

  const out = {
    type: 'topic'
  , channel: parts.shift().toLowerCase()
  , topic: null
  }

  if (parts[0]) {
    if (parts[0] === ':') {
      out.topic = ''
    } else {
      if (parts[0][0] === ':')
        parts[0] = parts[0].slice(1)
      out.topic = parts.join(' ')
    }
  }

  return out
}
