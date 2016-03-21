'use strict'

const path = require('path')
const fs = require('fs')

module.exports = Theme

function Theme(manager, file, name, active) {
  this.manager = manager
  this.file = file
  this.name = name
  this.active = active || false
}
