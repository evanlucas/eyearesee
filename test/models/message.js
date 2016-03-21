'use strict'

const test = require('tap').test
const Message = require('../../lib/models/message')

test('Message', (t) => {
  const d = Date.now()
  const opts = {
    message: 'This is a test'
  , to: '#node.js'
  , from: 'evanlucas'
  , hostmask: null
  , type: 'mention'
  , channel: {
      colorMap: new Map()
    }
  , ts: d
  }

  let m = new Message(opts)
  t.equal(m.message, 'This is a test')
  t.equal(m.to, '#node.js')
  t.equal(m.from, 'evanlucas')
  t.equal(m.hostmask, null)
  t.equal(m.type, 'mention')
  t.equal(m.ts, d)
  t.equal(m.formatted, 'This is a test')

  m = Message(opts)
  t.equal(m.message, 'This is a test')
  t.equal(m.to, '#node.js')
  t.equal(m.from, 'evanlucas')
  t.equal(m.hostmask, null)
  t.equal(m.type, 'mention')
  t.equal(m.ts, d)
  t.equal(m.formatted, 'This is a test')

  opts.type = 'join'
  m = Message(opts)
  t.equal(m.message, 'This is a test')
  t.equal(m.to, '#node.js')
  t.equal(m.from, 'evanlucas')
  t.equal(m.hostmask, null)
  t.equal(m.type, 'join')
  t.equal(m.ts, d)
  t.equal(m.formatted, 'This is a test')

  t.end()
})
