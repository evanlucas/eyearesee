'use strict'

const h = require('virtual-dom/h')

module.exports = function badge(count) {
  return h('.badge', '' + count)
}
