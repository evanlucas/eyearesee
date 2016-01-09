'use strict'

const BrowserWindow = require('browser-window')
const app = require('app')
const Menu = require('menu')
const path = require('path')

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
    width: 1200
  , height: 650
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
  , {
      label: 'Edit'
    , submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' }
      , { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' }
      , { type: 'separator' }
      , { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' }
      , { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' }
      , { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
