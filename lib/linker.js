'use strict'

const autolinker = require('autolinker')

module.exports = function linker(str) {
  return str

  // not sure I want to do this yet
  return autolinker.link(str)
}
