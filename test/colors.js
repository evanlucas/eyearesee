'use strict'

const test = require('tap').test
const colors = require('../lib/colors')

test('colors', (t) => {
  t.type(colors.colors, Array)
  t.type(colors.nextColor, 'function')

  const c = colors.nextColor()
  t.equal(c, 'green')

  t.end()
})
