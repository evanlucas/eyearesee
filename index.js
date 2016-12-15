'use strict'

const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const path = require('path')
const shortcuts = electron.globalShortcut
const fs = require('fs')
const v8 = require('v8')
v8.setFlagsFromString('--harmony')

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
  setupHome()
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

  const App = require('./lib/app')
  App.create({
    resourcePath: process.env.EYEARESEE_RESOURCE_PATH
  , version: require('./package').version
  , window: mainWindow
  })

  mainWindow.loadURL(index)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.DEV_MODE) {
    mainWindow.once('show', () => {
      console.log('opening dev tools')
      mainWindow.openDevTools({
        detach: true
      })
    })
  }
}

function setupHome() {
  const e = process.env.EYEARESEE_HOME
  if (e) return

  let home = path.join(app.getPath('home'), '.eyearesee')

  try {
    home = fs.realPathSync(home)
  } catch (_) {
    // ignore :/
  }

  process.env.EYEARESEE_HOME = home
  process.env.EYEARESEE_RESOURCE_PATH = __dirname
}
