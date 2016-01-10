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

    const div = h('li.pure-menu-item', [
      h('a.pure-menu-link', {
        href: chan.name
      , id: `channel-${chan.name}`
      , className: chan.active ? 'active' : ''
      , onclick: function(e) {
          self.handleClick(e, chan)
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
