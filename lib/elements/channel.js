'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const Userbar = require('./userbar')

module.exports = Channel

function Channel(target) {
  Base.call(this, target)
}
inherits(Channel, Base)

Channel.prototype.render = function render(channel) {
  const ub = new Userbar(this.target)
  const logs = channel.logs
  const l = logs.map((log) => {
    const color = channel.userMap.get(log.from)
    return h('li', [
      h('span', {
        className: `username ${color || ''}`
      }, log.from)
    , h('span.content', log.message)
    ])
  })

  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', channel.name)
      , h('p.subtitle', {
          innerHTML: channel.topic
        })
      ])
    ])
  , h('.channel-container', [
      h('ul.logs', l)
    , ub.render(channel.names)
    ])
  ]
}
