'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const Userbar = require('./userbar')
const linker = require('../linker')
const Message = require('./message-log')

module.exports = Channel

function Channel(target) {
  if (!(this instanceof Channel))
    return new Channel(target)

  Base.call(this, target)

  this.ub = new Userbar(this.target)
  this.message = new Message(this.target)
}
inherits(Channel, Base)

Channel.prototype.render = function render(channel) {
  const logs = channel.messages
  const l = logs.map((log) => {
    return this.message.render(log, channel)
  })

  var topic = channel.topic

  const linked = linker(channel.topic)
  if (linked !== channel.topic) {
    topic = {
      innerHTML: linked
    }
  }

  const cl = (channel.joined || channel.type === 'private')
    ? 'joined'
    : ''

  const hideUserbar = this.target.settings.get('userbar.hidden')

  const ubcl = hideUserbar
    ? 'userbar-hidden'
    : 'userbar-shown'

  const kids = hideUserbar
    ? [h('ul.logs', l)]
    : [h('ul.logs', l), this.ub.render(channel.names)]

  return [
    h('irc-header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', channel.name)
      , h('p.subtitle', topic)
      ])
    ])
  , h(`.channel-container.${ubcl}`, {
      className: cl
    }, kids)
  ]
}
