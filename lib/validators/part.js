'use strict'

module.exports = function part(parts) {
  if (parts.length < 1)
    return null

  const out = {
    type: 'part'
  , channels: []
  , message: ''
  }

  // /part #node.js
  // /part #node.js,#node-dev
  const chans = parts.shift().split(',')
  for (var i = 0; i < chans.length; i++) {
    out.channels.push(chans[i].toLowerCase())
  }

  // /part #node.js I'll see you later
  if (parts.length) {
    out.message = parts.join(' ')
  }

  return out
}
