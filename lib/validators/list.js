'use strict'

module.exports = function list(parts) {
  // /list [channel[,channel]] [server]

  const out = {
    type: 'list'
  , channels: []
  , server: null
  }

  if (!parts.length)
    return out

  if (parts[0]) {
    const chans = parts[0].split(',')
    for (var i = 0; i < chans.length; i++) {
      out.channels.push(chans[i].toLowerCase())
    }
  }

  if (parts[1]) {
    out.server = parts[1]
  }

  return out
}
