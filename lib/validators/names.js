'use strict'

module.exports = function names(parts) {
  // /names [channel[, channel]]

  const out = {
    type: 'names'
  , channels: []
  }

  if (parts[0]) {
    const chans = parts[0].split(',')
    for (var i = 0; i < chans.length; i++) {
      out.channels.push(chans[i].toLowerCase())
    }
  }

  return out
}
