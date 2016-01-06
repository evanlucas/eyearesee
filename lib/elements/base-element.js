'use strict'

// Taken from https://github.com/moose-team/friends/blob/master/lib/elements/base-element.js

const EE = require('events')
const inherits = require('util').inherits

module.exports = BaseElement

function BaseElement(target) {
  EE.call(this)

  this.target = target || null
}
inherits(BaseElement, EE)

BaseElement.prototype.send = function send() {
  if (this.target && typeof this.target.emit === 'function') {
    this.target.emit.apply(this.target, arguments)
  }
}
