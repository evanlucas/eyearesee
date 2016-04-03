'use strict'

const inherits = require('util').inherits
const EE = require('events')
const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow

module.exports = App

function App(opts) {
  EE.call(this)
  opts = opts || {}
  this.resourcePath = opts.resourcePath
  this.version = opts.version
  this.window = opts.window
  this.handleEvents()
  app.commandLine.appendSwitch('js-flags', '--harmony')
}
inherits(App, EE)

App.create = function create(opts) {
  return new App(opts)
}

App.prototype.handleEvents = function() {
  this.on('app:quit', () => {
    app.quit()
  })

  if (process.platform === 'darwin') {
    this.on('application:zoom', () => {
      Menu.sendActionToFirstResponder('zoom:')
    })
  } else {
    this.on('application:zoom', () => {
      BrowserWindow.getFocusedWindow().maximize()
    })
  }

  ipcMain.on('command', (ev, cmd) => {
    this.emit(cmd)
  })
}
