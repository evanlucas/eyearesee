'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')

module.exports = Userbar

function Userbar(target) {
  Base.call(this, target)
}
inherits(Userbar, Base)

Userbar.prototype.render = function render(users) {
  const us = users.map((user) => {
    const text = user.mode
      ? `${user.mode}${user.name}`
      : ` ${user.name}`
    return h('li.user', text)
  })

  return [
    h('#userbar', [
      h('ul.users', us)
    ])
  ]
}
