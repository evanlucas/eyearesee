'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const utils = require('../utils')
const linker = require('../linker')

module.exports = Message

function Message(target) {
  Base.call(this, target)
}
inherits(Message, Base)

// msg must have a ts, from, and message
Message.prototype.render = function render(msg, channel) {
  const d = utils.date(msg.ts)
  const color = channel.userMap.get(msg.from) || ''
  const from = msg.from
  var m = utils.encode(msg.message)

  for (const item of channel.userMap.entries()) {
    const username = item[0]
    const color = item[1]

    if (~m.indexOf(username)) {
      m = m.replace(new RegExp(`\\b${username}\\b`, 'g'),
        `<span class="mention ${color || ''}">${username}</span>`)
    }
  }

  m = linker(m)

  return h('li', [
    h('span.ts', `[${d}]`)
  , h('span', {
      className: `username ${color}`
    }, `<${from}>`)
  , h('span.content', {
      innerHTML: m
    })
  ])
}
