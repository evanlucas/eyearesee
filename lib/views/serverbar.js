'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const Connection = require('./sidebar/connection')

module.exports = Serverbar

function Serverbar(target) {
  if (!(this instanceof Serverbar))
    return new Serverbar(target)

  Base.call(this, target)
  this.views = {
    conn: new Connection(target)
  }
}
inherits(Serverbar, Base)

Serverbar.prototype.render = function render() {
  const conns = this.target.connections
  const names = Object.keys(conns)
  const views = this.views
  const cs = names.map((conn) => {
    return views.conn.renderForServerBar(conns[conn])
  })

  return h('#serverbar.pure-u', [
    h('.nav', [
      h('.menu', [
        h('ul', cs)
      ])
    ])
  , h('.bottom', [
      h('a.add-connection', {
        innerHTML: '&#65291;'
      })
    ])
  ])
}
