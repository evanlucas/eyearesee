'use strict'

const BrowserWindow = require('browser-window')
const app = require('app')
const Menu = require('menu')
const path = require('path')
const MenuItem = require('menu-item')

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
  setupMenu()

  mainWindow = new BrowserWindow({
    width: 960
  , height: 650
  , 'min-height': 600
  , 'min-width': 400
  , resizable: true
  , center: true
  , title: name
  })

  mainWindow.loadURL(index)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupMenu() {
  const template = [
    {
      label: 'EyeAreSee'
    , submenu: [
        { label: 'About' }
      , { type: 'separator' }
      , { label: 'Toggle DevTools'
        , accelerator: 'Alt+Command+I'
        , click: function() {
            BrowserWindow.getFocusedWindow().toggleDevTools()
          }
        }
      , { label: 'Quit'
        , accelerator: 'Command+Q'
        , click: function() { app.quit() }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
