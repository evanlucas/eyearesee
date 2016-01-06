'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const Userbar = require('./userbar')
const linker = require('../linker')
const Message = require('./message')

module.exports = Channel

function Channel(target) {
  Base.call(this, target)

  this.ub = new Userbar(this.target)
  this.message = new Message(this.target)
}
inherits(Channel, Base)

Channel.prototype.render = function render(channel) {
  const logs = channel.logs
  const l = logs.map((log) => {
    return this.message.render(log, channel)
  })

  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', channel.name)
      , h('p.subtitle', {
          innerHTML: linker(channel.topic)
        })
      ])
    ])
  , h('.channel-container', [
      h('ul.logs', l)
    , this.ub.render(channel.names)
    ])
  ]
}
