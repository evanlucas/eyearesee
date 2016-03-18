'use strict'

const inherits = require('util').inherits
const EE = require('events')
const electron = require('electron')
const path = require('path')
const app = electron.app
const Menu = electron.Menu
const ipcMain = electron.ipcMain

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

  app.on('open-url', (ev, url) => {
    ev.preventDefault()
    console.log('open-url', ev, url)
  })

  if (process.platform === 'darwin') {
    this.on('app:hide', () => {
      Menu.sendActionToFirstResponder('hide:')
    })
    this.on('app:minimize', () => {
      Menu.sendActionToFirstResponder('performMiniaturize:')
    })
    this.on('app:zoom', () => Menu.sendActionToFirstResponder('zoom:'))
  } else {
    this.on('app:minimize', () => BrowserWindow.getFocusedWindow().minimize())
    this.on('app:zoom', () => BrowserWindow.getFocusedWindow().maximize())
  }

  this.openPathOnEvent('app:about', '/about')
  this.openPathOnEvent('app:show-settings', '/config')
  this.openPathOnEvent('app:show-license', '/license')

  ipcMain.on('command', (ev, cmd) => {
    console.log('emit %s', cmd)
    this.emit(cmd)
  })

  ipcMain.on('window-command', (ev, command, ...args) => {
    if (this.window[command])
      this.window[command](...args)
  })
}

App.prototype.openPathOnEvent = function(ev, path) {
  this.on(ev, () => {
    console.log('openPathOnEvent %s %s', ev, path)
    this.window.webContents.send('goto:url', path)
  })
}
