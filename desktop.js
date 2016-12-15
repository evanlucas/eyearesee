'use strict'

const inherits = require('util').inherits
const App = require('./app')
const electron = require('electron')
const remote = electron.remote
const app = remote.app
const ipcRenderer = electron.ipcRenderer
const shell = electron.shell
const currentWindow = remote.getCurrentWindow()
const Menu = remote.Menu
const pkg = require('./package')

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

Desktop.prototype._handlers = function _handlers() {
  return {
    'application:devtools': () => {
      const win = this.window
      if (win) win.toggleDevTools()
    }
  , 'application:next-panel': () => { this.panels.nextPanel() }
  , 'application:prev-panel': () => { this.panels.previousPanel() }
  , 'application:show-userbar': () => { this.panels.showUserbar() }
  , 'application:hide-userbar': () => { this.panels.hideUserbar() }
  , 'application:quit': () => { app.quit() }
  , 'application:minimize': () => {
      const win = this.window
      if (win) win.minimize()
    }
  , 'application:maximize': () => {
      const win = this.window
      if (win) win.maximize()
    }
  , 'application:open-repo': () => { this.emit('openUrl', pkg.repository.url) }
  }
}

Desktop.prototype.setupMenu = function setupMenu() {
  const handlers = this._handlers()

  const tmp = require(`./lib/menus/${process.platform}`)
  for (let toplevel of tmp) {
    const sub = toplevel.submenu
    if (sub && sub.length) {
      for (let item of sub) {
        if (item.url) {
          item.click = () => {
            this.router.goto(item.url)
          }
        } else if (item.command) {
          item.click = () => {
            if (handlers[item.command]) {
              handlers[item.command]()
            } else {
              ipcRenderer.send('command', item.command)
            }
          }
        }
      }
    }
  }

  const menu = Menu.buildFromTemplate(tmp)
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
