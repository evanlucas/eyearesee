'use strict'

const utils = require('../utils')

module.exports = Message

function Message(opts) {
  if (!(this instanceof Message))
    return new Message(opts)

  this.message = opts.message
  this.to = opts.to || ''
  this.from = opts.from || ''
  this.hostmask = opts.hostmask
  this.mention = opts.mention || false
  this.type = opts.type || 'message'

  // can either be a Channel or a PrivateMessage
  this.channel = opts.channel
  this.ts = opts.ts || Date.now()
  this.formatted = opts.formatted || ''
  if (this.type === 'join' || this.type === 'part') {
    this.processJoinPart()
  } else {
    this.process()
  }
}

Message.prototype.process = function process() {
  const chan = this.channel
  this.formatted = utils.processMessage(
    this.message
  , chan.colorMap
  , chan._connection
  )
}

Message.prototype.processJoinPart = function processJoinPart() {
  this.formatted = utils.encode(this.message)
}
