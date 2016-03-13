'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const utils = require('../utils')

module.exports = Log

function Log(target) {
  Base.call(this, target)
}
inherits(Log, Base)

// These are message logs
Log.prototype.render = function render(log, channel) {
  const d = utils.date(log.ts)
  const color = channel.colorMap.get(log.from.toLowerCase()) || ''
  const from = log.from
  const m = log.formatted
  const cl = log.mention ? 'mention' : log.type
  if (from) {
    return h(`li.${cl}`, [
      h('span.ts', `[${d}]`)
    , h(`span.username.${color}`, utils.formatNameForType(from, log.type))
    , h('span.content', {
        innerHTML: m
      })
    ])
  }

  return h(`li.${cl}`, [
    h('span.ts', `[${d}]`)
  , h('span.content', {
      innerHTML: m
    , key: 1
    })
  ])
}
