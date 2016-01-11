'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const ConnectionView = require('./sidebar/connection')
const Connection = require('../models/connection')
const Channel = require('../models/channel')
const Settings = require('../models/connection-settings')
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
  const active = this.target.nav.current
  let conn
  if (active instanceof Connection) {
    conn = active
  } else if (active instanceof Channel) {
    conn = active._connection
  } else if (active instanceof Settings) {
    conn = active.conn
  }

  // we should always have conn at this point
  // if we don't throw
  if (!conn) {
    throw new Error('An error occurred. Should have connection, but don\'t')
  }

  return h('.nav-inner', [
    views.logo.render()
  , h('.pure-menu', [views.connection.render(conn)])
  ])
}
