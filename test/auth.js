'use strict'

const test = require('tap').test
const auth = require('../lib/auth')
const keytar = require('keytar')

test('auth', (t) => {
  t.type(auth.saveCreds, 'function')
  t.type(auth.getCreds, 'function')
  t.end()
})

test('auth.saveCreds', (t) => {
  t.plan(5)
  const conn = 'name'

  // password exists
  let origGet = keytar.getPassword
  keytar.getPassword = function(service, username) {
    t.equal(service, 'EyeAreSee (IRC Client) - name')
    keytar.getPassword = origGet
    t.pass('called getPassword')
    return 'test'
  }

  let origReplace = keytar.replacePassword
  keytar.replacePassword = function(service, u, p) {
    keytar.replacePassword = origReplace
    t.pass('called replacePassword')
  }

  auth.saveCreds(conn, 'evan', 'pass')

  // password does not exist
  keytar.getPassword = function(s, u) {
    keytar.getPassword = origGet
    t.pass('called getPassword')
    return null
  }

  let origAdd = keytar.addPassword
  keytar.addPassword = function(s, u, p) {
    keytar.addPassword = origAdd
    t.pass('called addPassword')
  }

  auth.saveCreds(conn, 'evan', 'pass')
})

test('auth.getCreds', (t) => {
  t.plan(2)
  let orig = keytar.getPassword
  const name = 'name'
  keytar.getPassword = function(s, u) {
    t.equal(s, 'EyeAreSee (IRC Client) - name')
    keytar.getPassword = orig
    return 'test'
  }

  const out = auth.getCreds(name, 'evan')
  t.equal(out, 'test')
})
