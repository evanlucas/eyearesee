'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const Channels = require('./channels')
const utils = require('../../utils')
const remote = require('electron').remote
const Menu = remote.Menu
const MenuItem = remote.MenuItem

module.exports = Connection

function Connection(target) {
  Base.call(this, target)

  this.channels = new Channels(this.target)
}
inherits(Connection, Base)

Connection.prototype.handleClick = function handleClick(e, conn) {
  e.preventDefault()
  const ele = e.target
  if (ele) {
    ele.classList.add('active')
  }

  this.target.nav.showConnection(conn)
}

Connection.prototype.oncontextmenu = function oncontextmenu(e, conn) {
  e.preventDefault()
  const nav = this.target.nav
  const menu = new Menu()
  menu.append(new MenuItem({
    label: 'Connect'
  , enabled: !conn.connected
  , click: function() {
      debug('connect')
    }
  }))

  menu.append(new MenuItem({
    label: 'Settings'
  , click: function() {
      nav.showSettings(conn.settings)
    }
  }))

  menu.append(new MenuItem({
    label: 'Disconnect'
  , enabled: conn.connected
  , click: function() {
      debug('disconnect')
    }
  }))

  menu.popup(remote.getCurrentWindow())
}

Connection.prototype.render = function render(conn) {
  const self = this
  const id = utils.encodeConnection(conn.name)
  const chans = this.channels.render(conn.channels)
  return h('.connection', [
    h('ul.pure-menu-list', [
      h('li.pure-menu-item', [
        h('a.pure-menu-link', {
          href: id
        , id: id
        , className: conn.active ? 'active' : ''
        , onclick: function(e) {
            self.handleClick(e, conn)
          }
        , oncontextmenu: (e) => {
            this.oncontextmenu(e, conn)
          }
        , attributes: {
            navtype: 'connection'
          , navname: conn.name
          }
        }, conn.name)
      ])
    , h('li.pure-menu-heading.channels-heading', 'Channels')
    , h('.channels', chans)
    , h('li.pure-menu-heading.messages-heading', 'Messages')
    , h('.messages', [])
    , h('li.pure-menu-separator')
    ])
  ])
}
