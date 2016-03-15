'use strict'

const pkg = require('../package')

module.exports = About

function About() {
  this.name = 'EyeAreSee'
  this.version = pkg.version
  this.url = '/about'
  this.repo = pkg.repository.url
  this.active = false
}
