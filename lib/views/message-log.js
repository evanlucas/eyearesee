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

const validBoundaries = [
  ' '
, '('
, '['
, '.'
, '-'
]

// These are message logs
Log.prototype.render = function render(log, channel) {
  const d = utils.date(log.ts)
  const color = channel.colorMap.get(log.from) || ''
  const from = log.from
  var m = utils.encode(log.message)

  for (const item of channel.colorMap.entries()) {
    const username = item[0]
    const color = item[1]
    const ulen = username.length
    const re = new RegExp(`\\b${username}\\b`, 'g')
    if (re.test(m)) {
      let idx = m.indexOf(username)
      if (idx !== -1 && ~validBoundaries.indexOf(m[idx - 1])) {
        let stra = m.substring(0, idx)
        let strb = m.substring(stra.length + ulen) || ''
        m = stra + `<span class="mention ${color || ''}">${username}</span>` +
          strb
      }
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
