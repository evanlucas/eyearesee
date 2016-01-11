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

Serverbar.prototype.onAddConnection = function onAddConnection(e) {
  const nav = this.target.nav
  nav.showLogin()
}

Serverbar.prototype.render = function render() {
  const conns = this.target.connections
  const cs = new Array(conns.size)
  let i = 0
  for (const conn of conns.values()) {
    cs[i++] = this.views.conn.renderForServerBar(conn)
  }

  return h('#serverbar.pure-u', [
    h('.nav', [
      h('.menu', [
        h('ul', cs)
      ])
    ])
  , h('.bottom', [
      h('.tooltip.right.create', [
        h('.tooltip-arrow')
      , h('.tooltip-inner', 'Create Connection')
      ])
    , h('a.add-connection', {
        innerHTML: '&#65291;'
      , onclick: (e) => {
          this.onAddConnection(e)
        }
      })
    ])
  ])
}
