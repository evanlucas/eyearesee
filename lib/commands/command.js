'use strict'

module.exports = Command

function Command(cmd, description, args) {
  this.cmd = cmd
  this.description = description
  this.args = args || ''
  this.active = false
}
