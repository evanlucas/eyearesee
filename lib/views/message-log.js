'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const utils = require('../utils')
const linker = require('../linker')

module.exports = Log

function Log(target) {
  Base.call(this, target)
}
inherits(Log, Base)

// These are message logs
Log.prototype.render = function render(log, channel) {
  const d = utils.date(log.ts)
  const color = channel.colorMap.get(log.from) || ''
  const from = log.from
  var m = utils.encode(log.message)

  for (const item of channel.colorMap.entries()) {
    const username = item[0]
    const color = item[1]

    if (~m.indexOf(username)) {
      m = m.replace(new RegExp(`\\b${username}\\b`, 'g'),
        `<span class="mention ${color || ''}">${username}</span>`)
    }
  }

  m = linker(m)

  return h(`li.${log.type}`, [
    h('span.ts', `[${d}]`)
  , h('span', {
      className: `username ${color}`
    }, utils.formatNameForType(from, log.type))
  , h('span.content', {
      innerHTML: m
    })
  ])
}
