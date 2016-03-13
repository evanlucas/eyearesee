'use strict'

const utils = require('../utils')
const linker = require('../linker')

module.exports = ConsoleMessage

function ConsoleMessage(opts) {
  if (!(this instanceof ConsoleMessage))
    return new ConsoleMessage(opts)

  this.message = opts.message
  this.from = opts.from
  this.type = opts.type
  this.ts = opts.ts || Date.now()
  this.channel = opts.channel
  this.formatted = opts.formatted || ''
  this.process()
}

ConsoleMessage.prototype.process = function process() {
  this.formatted = linker(utils.encode(this.message))
}
