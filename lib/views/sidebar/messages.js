'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const debug = require('debug')('eyearesee:views:messages')

module.exports = Messages

function Messages(target) {
  Base.call(this, target)
}
inherits(Messages, Base)

Messages.prototype.handleClick = function handleClick(e, chan) {
  e.preventDefault()
  this.target.router.goto(chan.url)
}

Messages.prototype.oncontextmenu = function oncontextmenu(e, message) {
  e.preventDefault()

  const remote = require('electron').remote
  const Menu = remote.Menu
  const MenuItem = remote.MenuItem
  const menu = new Menu()

  menu.append(new MenuItem({
    label: 'Close Message'
  , click: () => {
      debug('removing message')
      const conn = message.conn
      message.partAndDestroy()
      if (this.target.url === message.url)
        this.target.router.goto(conn.url)
    }
  }))

  menu.popup(remote.getCurrentWindow())
}

Messages.prototype.render = function render(chans) {
  const out = []
  const self = this

  for (const chan of chans.values()) {
    const kids = [
      chan.name
    ]

    if (chan.unread) {
      kids.push(h('.badge', '' + chan.unread))
    }

    const active = chan.url === this.target.url

    const div = h('li.pure-menu-item', [
      h('a.pure-menu-link', {
        href: chan.name
      , id: `channel-${chan.name}`
      , className: active ? 'current' : ''
      , onclick: function(e) {
          self.handleClick(e, chan)
        }
      , oncontextmenu: (e) => {
          this.oncontextmenu(e, chan)
        }
      , attributes: {
          navtype: 'private'
        , navname: chan.name
        , connection: chan.conn.name
        }
      }, kids)
    ])

    out.push(div)
  }

  return out
}
