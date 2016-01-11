'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const Channels = require('./channels')
const Messages = require('./messages')
const utils = require('../../utils')

module.exports = Connection

function Connection(target) {
  Base.call(this, target)

  this.channels = new Channels(this.target)
  this.messages = new Messages(this.target)
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

  const remote = require('electron').remote
  const Menu = remote.Menu
  const MenuItem = remote.MenuItem
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
      e.preventDefault()
      nav.showSettings(conn.settings)
      return false
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

Connection.prototype.renderForServerBar = function renderForServerBar(conn) {
  const self = this
  let active = conn.active
  const current = this.target.nav.current
  if (!active && current) {
    active = (current._connection === conn)
  }
  
  const id = `tooltip-${conn.name.replace(/\W+/g, '_')}`
  return h('li', [
    h('.tooltip.right', {
      id: id
    }, [
      h('.tooltip-arrow')
    , h('.tooltip-inner', conn.name)
    ])
  , h('a', {
      className: active ? 'active' : ''
    , onclick: function(e) {
        self.handleClick(e, conn)
      }
    , oncontextmenu: (e) => {
        this.oncontextmenu(e, conn)
      }
    , attributes: {
        navtype: 'connection'
      , navname: conn.name
      , tooltipid: id
      }
    }, conn.name[0].toUpperCase())
  ])
}

Connection.prototype.render = function render(conn) {
  const self = this
  const id = utils.encodeConnection(conn.name)
  const chans = this.channels.render(conn.channels)
  const privs = this.messages.render(conn.privateMessages)

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
    , h('.messages', privs)
    , h('li.pure-menu-separator')
    ])
  ])
}
