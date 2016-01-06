'use strict'

const test = require('tap').test
const utils = require('../lib/utils')

test('date', (t) => {
  const d = new Date()
  d.setSeconds(2)
  let s = `0${d.getSeconds()}`
  const m = d.getMinutes()
  const h = d.getHours()
  const exp = `${h}:${m}:${s}`
  t.equal(utils.date(d.getTime()), exp, exp)
  t.end()
})

test('encode', (t) => {
  const input = 'Hello <Name> & Test Thing "'
  const exp = 'Hello &lt;Name&gt; &amp; Test Thing &quot;'
  t.equal(utils.encode(input), exp, exp)
  t.end()
})
