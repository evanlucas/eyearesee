'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')

module.exports = Server

function Server(target) {
  Base.call(this, target)
}
inherits(Server, Base)

Server.prototype.render = function render() {
  const data = this.target.data
  const s = data.server
  const info = `${s.host}:${s.port}`

  const logs = data.logs

  const l = logs.map((log) => {
    return h('li', log)
  })

  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', 'Logs')
      , h('p.subtitle', info)
      ])
    ])
  , h('.logs-container', [
      h('ul.logs', l)
    ])
  ]
}
