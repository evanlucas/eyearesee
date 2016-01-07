'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits

module.exports = Userbar

function Userbar(target) {
  if (!(this instanceof Userbar))
    return new Userbar(target)

  Base.call(this, target)
}
inherits(Userbar, Base)

Userbar.prototype.render = function render(names) {
  const out = new Array(names.length)

  for (var i = 0; i < names.length; i++) {
    const user = names[i]
    const text = user.mode
      ? `${user.mode}${user.name}`
      : ` ${user.name}`
    const div = h('li.user', text)
    out[i] = div
  }

  return [
    h('#userbar', [
      h('ul.users', out)
    ])
  ]
}
