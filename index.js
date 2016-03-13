'use strict'

const BrowserWindow = require('browser-window')
const app = require('app')
const path = require('path')
const electron = require('electron')
const shortcuts = electron.globalShortcut

const name = 'EyeAreSee'
const index = `file://${path.join(__dirname, 'views', 'index.html')}`

app.on('ready', setup)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

var mainWindow

function setup() {
  shortcuts.unregister('ctrl+r')

  mainWindow = new BrowserWindow({
    width: 1200
  , height: 730
  , 'min-height': 400
  , 'min-width': 600
  , resizable: true
  , center: true
  , title: name
  })

  mainWindow.loadURL(index)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
