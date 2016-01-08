'use strict'

module.exports = function join(parts) {
  // /join channels[, keys]
  if (parts.length < 1)
    return null

  const out = {
    type: 'join'
  , channels: []
  , keys: []
  }

  // /join 0
  if (parts[0] === '0') {
    out.channels.push('0')
    return out
  }

  // join #node.js
  // join #node.js,#node-dev
  if (parts[0]) {
    const chans = parts[0].split(',')
    for (var i = 0; i < chans.length; i++) {
      out.channels.push(chans[i].toLowerCase())
    }
  }

  // join #node.js key
  // join #node.js,#node-dev key1,key2
  if (parts[1]) {
    const keys = parts[1].split(',')
    for (var i = 0; i < keys.length; i++) {
      // these may be case sensitive
      out.keys.push(keys[i])
    }
  }

  return out
}
