'use strict'

const inherits = require('util').inherits
const App = require('./app')
const remote = require('remote')
const app = remote.require('app')
const BrowserWindow = remote.require('browser-window')
const shell = require('shell')
const currentWindow = remote.getCurrentWindow()
const Menu = remote.require('menu')

module.exports = Desktop

function Desktop() {
  if (!(this instanceof Desktop))
    return new Desktop()

  App.call(this, document.body, currentWindow)

  this.setupMenu()

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

Desktop.prototype.setupMenu = function setupMenu() {
  const template = [
    {
      label: 'EyeAreSee'
    , submenu: [
        { label: 'About'
        , click: () => {
            this.showAbout()
          }
        }
      , { label: 'Settings'
        , accelerator: 'CommandOrControl+,'
        , click: () => {
            this.showSettings()
          }
        }
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
  , {
      label: 'View'
    , submenu: [
        { label: 'Next Panel'
        , accelerator: 'CommandOrControl+Alt+Down'
        , click: () => {
            this.nextPanel()
          }
        }
      , { label: 'Previous Panel'
        , accelerator: 'CommandOrControl+Alt+Up'
        , click: () => {
            this.previousPanel()
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

Desktop.prototype.setBadge = function setBadge(n) {
  if (!app.dock)
    return

  if (n === false) {
    return app.dock.setBadge('')
  } else if (n == null) {
    // Don't add a badge if the current window is already focused
    if (currentWindow.isFocused())
      return app.dock.setBadge('')

    this._notifications++
  } else {
    this._notifications = n
  }

  app.dock.setBadge(this._notifications.toString())
}
