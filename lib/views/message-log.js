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
  const color = channel.colorMap.get(log.from) || ''
  const from = log.from
  const m = utils.processMessage(utils.encode(log.message), channel.colorMap)

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
