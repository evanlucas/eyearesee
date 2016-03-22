'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = Channels

function Channels(target) {
  Base.call(this, target)
}
inherits(Channels, Base)

Channels.prototype.handleClick = function handleClick(e, chan) {
  e.preventDefault()
  const ele = e.target
  if (ele) {
    ele.classList.add('active')
  }
  this.target.nav.showChannel(chan)
}

Channels.prototype.oncontextmenu = function oncontextmenu(e, chan) {
  const remote = require('electron').remote
  const Menu = remote.Menu
  const MenuItem = remote.MenuItem
  const menu = new Menu()

  menu.append(new MenuItem({
    label: 'Join'
  , enabled: !chan.joined
  , click: function() {
      chan.join()
    }
  }))

  menu.append(new MenuItem({
    label: 'Part'
  , enabled: chan.joined
  , click: function() {
      chan.part()
    }
  }))

  menu.append(new MenuItem({
    label: 'Remove'
  , click: function() {
      chan.partAndDestroy()
    }
  }))
  menu.popup(remote.getCurrentWindow())
}

Channels.prototype.render = function render(chans) {
  const out = []
  const self = this

  for (const chan of chans.values()) {
    const kids = [
      chan.name
    ]

    if (chan.unread) {
      kids.push(h('.badge', '' + chan.unread))
    }

    let classNames = []

    if (chan.active) classNames.push('active')
    if (chan.joined) classNames.push('joined')
    else classNames.push('not-joined')

    const div = h('li.pure-menu-item', [
      h('a.pure-menu-link', {
        href: chan.name
      , id: `channel-${chan.name}`
      , className: classNames.join(' ')
      , onclick: function(e) {
          self.handleClick(e, chan)
        }
      , oncontextmenu: (e) => {
          this.oncontextmenu(e, chan)
        }
      , attributes: {
          navtype: 'channel'
        , navname: chan.name
        , connection: chan._connection.name
        }
      }, kids)
    ])

    out.push(div)
  }

  return out
}
