'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const debug = require('debug')('eyearesee:channels')

module.exports = Channels

function Channels(target) {
  Base.call(this, target)
}
inherits(Channels, Base)

Channels.prototype.render = function render() {
  const cs = this.target.data.channels
  const chans = Object.keys(cs)

  const channels = chans.map((channel) => {
    // give the channel a little padding
    const ar = [`${channel} `]
    if (cs[channel].unread) {
      ar.push(h('span.badge', '' + cs[channel].unread))
    }

    debug('ar', ar)
    return h('li.pure-menu-item', [
      h('a.pure-menu-link', {
        href: `${channel}`
      , id: `channel-${channel}`
      }, ar)
    ])
  })

  channels.unshift(h('li.pure-menu-heading#channels', 'Channels'))

  return channels
}
