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
  const lower = (log.from || '').toLowerCase()
  let mycol
  if (channel.conn) {
    const connNick = channel.conn.nick
    if (connNick && connNick.toLowerCase() === lower) {
      mycol = this.target.settings.get('user.color')
    }
  }

  const color = mycol || channel.colorMap.get((log.from || '').toLowerCase())
  const from = log.from
  const m = log.formatted
  const cl = log.mention ? 'mention' : log.type
  if (from) {
    const formattedName = utils.formatNameForType(from, log.type)
    const un = mycol
      ? h('span.username', {
          style: {
            color: mycol
          }
        }, formattedName)
      : h(`span.username.${color}`, formattedName)
    return h(`li.${cl}`, [
      h('span.ts', `[${d}]`)
    , un
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
