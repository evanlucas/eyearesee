'use strict'

const test = require('tap').test
const User = require('../../lib/models/user')

test('User', (t) => {
  const opts = {
    nickname: 'nick'
  , username: 'nick'
  , address: 'unaffiliated/nick'
  , realname: 'nick'
  , mode: '@'
  , color: 'red'
  }

  let u = new User(opts)

  t.deepEqual(u, opts)

  u = User(opts)
  t.deepEqual(u, opts)
  t.end()
})
