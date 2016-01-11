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
  , channel: 'test'
  , ts: d
  }

  let m = new Message(opts)
  t.deepEqual(m, opts)
  t.deepEqual(Message(m), opts)
  t.end()
})
