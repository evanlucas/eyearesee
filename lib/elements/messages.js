'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')

module.exports = Messages

function Messages(target) {
  Base.call(this, target)
}
inherits(Messages, Base)

Messages.prototype.render = function render() {
  const msgs = Object.keys(this.target.data.messages)

  const messages = msgs.map((message) => {
    return h('li.pure-menu-item', [
      h('a.pure-menu-link', {
        href: `#${message}`
      , id: `message-${message}`
      }, message)
    ])
  })

  messages.unshift(h('li.pure-menu-heading#messages', 'Messages'))

  return messages
}
