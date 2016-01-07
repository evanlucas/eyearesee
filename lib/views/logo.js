'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = Logo

function Logo(target) {
  if (!(this instanceof Logo))
    return new Logo(target)

  Base.call(this, target)
}
inherits(Logo, Base)

Logo.prototype.render = function render() {
  return h('#logo', [
    h('i.fa.fa-eye')
  , h('span.logoname', 'EyeAreSee')
  ])
}
