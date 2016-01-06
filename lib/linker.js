'use strict'

const autolinker = require('autolinker')

module.exports = function linker(str) {
  return autolinker.link(str, {
    twitter: false
  , hashtags: false
  , className: 'external-url'
  })
}
