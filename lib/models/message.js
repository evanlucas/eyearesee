'use strict'

module.exports = Message

function Message(opts) {
  if (!(this instanceof Message))
    return new Message(opts)

  this.message = opts.message
  this.to = opts.to || ''
  this.from = opts.from || ''
  this.hostmask = opts.hostmask
  this.type = opts.type || 'message'

  // can either be a Channel or a PrivateMessage
  this.channel = opts.channel
  this.ts = opts.ts || Date.now()
}
