'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const Log = require('./connection-log')

module.exports = Connection

function Connection(target) {
  if (!(this instanceof Connection))
    return new Connection(target)

  Base.call(this, target)

  this.log = new Log(target)
}
inherits(Connection, Base)

Connection.prototype.render = function render(conn) {
  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', conn.name)
      , h('p.subtitle', `${conn.host}:${conn.port}`)
      ])
    ])
  , h('.logs-container', [
      h('ul.logs', conn.logs.map((log) => {
        return this.log.render(log)
      }))
    ])
  ]
}
