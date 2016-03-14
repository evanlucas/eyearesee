'use strict'

const utils = require('../utils')

module.exports = function part(parts) {
  const out = {
    type: 'part'
  , channels: []
  , message: ''
  }

  if (!parts.length)
    return out

  // /part
  const firstPart = parts.shift()
  if (!utils.isValidChannel(firstPart)) {
    parts.unshift(firstPart)
    out.channels = []
  } else {
    // /part #node.js
    // /part #node.js,#node-dev
    const chans = firstPart.split(',')
    for (var i = 0; i < chans.length; i++) {
      out.channels.push(chans[i].toLowerCase())
    }
  }

  // /part #node.js I'll see you later
  if (parts.length) {
    out.message = parts.join(' ')
  }

  return out
}
