'use strict'

const inherits = require('util').inherits
const App = require('./app')
const remote = require('remote')
const app = remote.require('app')
const shell = require('shell')
const BrowserWindow = remote.require('browser-window')
const currentWindow = remote.getCurrentWindow()

module.exports = Desktop

function Desktop() {
  if (!(this instanceof Desktop))
    return new Desktop()

  console.log('DESKTOP')
  App.call(this, document.body, currentWindow)

  currentWindow.on('focus', () => {
    this.setBadge(false)
  })

  this.on('setBadge', (n) => {
    this.setBadge(n)
  })

  this.on('openUrl', (url) => {
    shell.openExternal(url)
  })
}
inherits(Desktop, App)

Desktop.prototype.setBadge = function setBadge(n) {
  if (!app.dock)
    return

  if (n === false) {
    return app.dock.setBadge('')
  } else if (n == null) {
    this._notifications++
  } else {
    this._notifications = n
  }

  app.dock.setBadge(this._notifications.toString())
}
