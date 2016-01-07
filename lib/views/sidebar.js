'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const Connection = require('./sidebar/connection')
const Logo = require('./logo')

module.exports = Sidebar

function Sidebar(target) {
  if (!(this instanceof Sidebar))
    return new Sidebar(target)

  Base.call(this, target)

  this.views = {
    connection: new Connection(target)
  , logo: new Logo(target)
  }
}
inherits(Sidebar, Base)

Sidebar.prototype.render = function render() {
  const views = this.views
  // each connection will be wrapped in a .connection container
  const connections = this.target.connections
  const keys = Object.keys(connections)
  const conns = keys.map((conn) => {
    return views.connection.render(connections[conn])
  })

  return h('.nav-inner', [
    views.logo.render()
  , h('.pure-menu', conns)
  ])
}
