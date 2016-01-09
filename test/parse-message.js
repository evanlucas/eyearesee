'use strict'

const test = require('tap').test
const parse = require('../lib/parse-message')

test('parse', (t) => {
  t.equal(parse(), undefined)

  var input = 'hello this is a message'
  var out = parse(input)
  t.deepEqual(out, {
    type: '_message'
  , data: input
  })

  var input = '/list'
  var out = parse(input)
  t.deepEqual(out, {
    type: 'list'
  , channels: []
  , server: null
  })

  var input = '/invite evanlucas #node.js'
  var out = parse(input)
  t.deepEqual(out, {
    type: 'invite'
  , channel: '#node.js'
  , nick: 'evanlucas'
  })

  var input = '/msg biscuits "hello my name" is tom'
  var out = parse(input)
  t.deepEqual(out, {
    type: 'msg'
  , target: 'biscuits'
  , message: '"hello my name" is tom'
  })
  t.end()
})
