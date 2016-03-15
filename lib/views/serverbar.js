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
  e.preventDefault()
  this.target.newConnectionTip.hide(() => {
    setTimeout(() => {
      const nav = this.target.nav
      nav.showLogin()
    }, 50)
  })
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
      h('a.add-connection', {
        innerHTML: '&#65291;'
      , onclick: (e) => {
          this.onAddConnection(e)
        }
      , attributes: {
          'data-title': 'Create Connection'
        , 'data-toggle': 'tooltip'
        , 'data-trigger': 'hover'
        }
      })
    ])
  ])
}
