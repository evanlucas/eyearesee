'use strict'

const test = require('tap').test
const utils = require('../lib/utils')

test('date', (t) => {
  const d = new Date()
  d.setSeconds(2)
  d.setMinutes(8)
  d.setHours(8)
  let s = `0${d.getSeconds()}`
  const m = `0${d.getMinutes()}`
  const h = `0${d.getHours()}`
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

test('flatten', (t) => {
  const input = [
    { type: 'notice', message: 'A' }
  , { type: 'notice', message: 'B' }
  , { type: 'topic', message: 'C', channel: 'D' }
  , { type: 'topic', message: 'E', channel: 'F' }
  , { type: 'notice', message: 'G' }
  , { type: 'topic', message: 'H', channel: 'I' }
  ]
  const out = utils.flatten(input)
  const exp = [
    { type: 'notice', messages: ['A', 'B'], channel: undefined }
  , { type: 'topic', messages: ['C'], channel: 'D' }
  , { type: 'topic', messages: ['E'], channel: 'F' }
  , { type: 'notice', messages: ['G'], channel: undefined }
  , { type: 'topic', messages: ['H'], channel: 'I' }
  ]
  t.deepEqual(out, exp)

  const i2 = [
    { type: 'notice', message: '*** Looking up your hostname...' }
  , { type: 'notice', message: '*** Checking Ident' }
  , { type: 'notice', message: '*** Found your hostname' }
  , { type: 'notice', message: '*** No Ident response' }
  ]
  const o2 = utils.flatten(i2)
  const e2 = [
    { type: 'notice', messages: [
      '*** Looking up your hostname...'
    , '*** Checking Ident'
    , '*** Found your hostname'
    , '*** No Ident response'
    ], channel: null}
  ]

  t.deepEqual(o2, e2)

  t.end()
})
