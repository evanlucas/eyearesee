'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const Connection = require('eyearesee-client').Connection
const ConnectionView = require('./sidebar/connection')
const Logo = require('./logo')

module.exports = Sidebar

function Sidebar(target) {
  if (!(this instanceof Sidebar))
    return new Sidebar(target)

  Base.call(this, target)

  this.views = {
    connection: new ConnectionView(target)
  , logo: new Logo(target)
  }
}
inherits(Sidebar, Base)

Sidebar.prototype.render = function render() {
  const views = this.views
  const active = this.target.activeModel
  let conn
  if (active instanceof Connection) {
    conn = active
  } else if (active && active.getConnection) {
    conn = active.getConnection()
  }

  const kids = conn
    ? [views.connection.render(conn)]
    : []

  return h('.nav-inner', [
    views.logo.render()
  , h('.pure-menu', kids)
  ])
}
