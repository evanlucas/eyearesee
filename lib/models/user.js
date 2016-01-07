'use strict'

module.exports = User

function User(opts) {
  if (!(this instanceof User))
    return new User(opts)

  this.nickname = opts.nickname
  this.username = opts.username
  this.address = opts.address
  this.realname = opts.realname

  this.mode = opts.mode

  // this will be the class name of the color for this user
  this.color = opts.color
}
