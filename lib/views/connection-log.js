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

// These are connection logs
Log.prototype.render = function render(log) {
  const d = utils.date(log.ts)

  const className = log.type

  const m = log.formatted

  return h('li', {
    className: className
  }, [
    h('span.ts', `[${d}]`)
  , h('span.content', {
      innerHTML: m
    , key: 2
    })
  ])
}
