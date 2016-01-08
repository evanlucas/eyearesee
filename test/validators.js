'use strict'

const test = require('tap').test
const fixtures = require('./fixtures/validators')
const val = require('../lib/validators')
const argsplit = require('argsplit')

const keys = Object.keys(fixtures)

keys.forEach(function(key) {
  test(key, (t) => {
    const arr = fixtures[key]
    arr.forEach(function(fix) {
      const input = argsplit(fix.input)
      input.shift()
      t.deepEqual(val[key](input), fix.output, fix.input)
    })

    t.end()
  })
})
