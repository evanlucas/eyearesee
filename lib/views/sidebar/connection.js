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
  this.target.router.goto(conn.url)
}

Connection.prototype.oncontextmenu = function oncontextmenu(e, conn) {
  e.preventDefault()

  const remote = require('electron').remote
  const Menu = remote.Menu
  const MenuItem = remote.MenuItem
  const menu = new Menu()
  menu.append(new MenuItem({
    label: 'Connect'
  , enabled: !conn.connected
  , click: () => {
      conn.connect()
    }
  }))

  menu.append(new MenuItem({
    label: 'Settings'
  , click: function() {
      e.preventDefault()
      this.target.router.goto(`${conn.url}/settings`)
      return false
    }
  }))

  menu.append(new MenuItem({
    label: 'Disconnect'
  , enabled: conn.connected
  , click: () => {
      conn.disconnect()
    }
  }))

  menu.popup(remote.getCurrentWindow())
}

Connection.prototype.renderForServerBar = function renderForServerBar(conn) {
  const self = this
  const active = Boolean(~this.target.url.indexOf(conn.url))

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
  const privs = this.messages.render(conn.queries)
  const active = conn.url === this.target.url

  return h('.connection', [
    h('ul.nav-pills.nav-stacked', [
      h('li.pure-menu-item', {
        className: active ? 'current' : ''
      }, [
        h('a.pure-menu-link', {
          href: id
        , id: id
        , onclick: function(e) {
            self.handleClick(e, conn)
          }
        , oncontextmenu: (e) => {
            this.oncontextmenu(e, conn)
          }
        , attributes: {
            navtype: 'connection'
          , navname: conn.name
          , tabindex: '-1'
          }
        }, conn.name)
      ])
    , h('li.menu-heading.channels-heading', 'Channels')
    , h('ul.channels.nav-pills.nav-stacked', chans)
    , h('li.menu-heading.messages-heading', 'Messages')
    , h('ul.messages.nav-pills.nav-stacked', privs)
    , h('li.pure-menu-separator')
    ])
  ])
}
