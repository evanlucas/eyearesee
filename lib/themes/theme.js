'use strict'

module.exports = Theme

function Theme(manager, file, name, active) {
  this.manager = manager
  this.file = file
  this.name = name
  this.active = active || false
}
