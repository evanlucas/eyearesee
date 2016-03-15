'use strict'

module.exports = Nav

function Nav(app) {
  if (!(this instanceof Nav))
    return new Nav(app)

  this.app = app
  this.current = null
}

Nav.prototype.showChannel = function showChannel(chan) {
  if (this.current) {
    this.current.active = false
  }

  chan.active = true
  if (chan.unread)
    chan.unread = 0

  this.current = chan
  this.app.needsLayout()
}

Nav.prototype.showConnection = function showConnection(conn) {
  if (this.current) {
    this.current.active = false
  }

  conn.active = true
  this.current = conn
  this.app.needsLayout()
}

Nav.prototype.showSettings = function showSettings(settings) {
  if (this.current) {
    this.current.active = false
  }

  settings.active = true
  settings.conn.active = true
  this.current = settings
  this.app.needsLayout()
}

Nav.prototype.showLogin = function showLogin() {
  if (this.current) {
    this.current.active = false
  }
  this.current = null
  this.app.needsLayout()
}

Nav.prototype.showAbout = function showAbout() {
  if (this.current) {
    this.current.active = false
  }

  this.app.about.active = true
  this.current = this.app.about
  this.app.needsLayout()
}
