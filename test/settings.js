'use strict'

const test = require('tap').test
const path = require('path')
const fixtures = require('./common').fixtures
const Settings = require('../lib/settings')
const levelup = require('levelup')
const leveldown = require('leveldown')
const dbName = new Buffer(String(Date.now())).toString('hex')
const dbPath = path.join(fixtures, dbName)

test('Settings', (t) => {
  t.throws(function() {
    new Settings()
  }, /db is required/)

  let db = {}
  let s = Settings(db)
  t.type(s, Settings)
  t.type(s._map, Map)
  t.equal(s.db, db)
  t.end()
})

test('load', (t) => {
  const db = levelup(dbPath, {
    db: leveldown
  , valueEncoding: 'json'
  })

  const settings = new Settings(db)
  const val = settings.get('test')
  t.equal(val, undefined)

  settings.set('logLimit', 300, (err) => {
    if (err) throw err
    t.equal(settings.get('logLimit'), 300)

    // now let's try to load it
    settings.load((err) => {
      t.equal(settings.get('logLimit'), 300)
      settings.del('logLimit', (err) => {
        if (err) throw err
        t.equal(settings.get('logLimit'), undefined)
        db.close((err) => {
          if (err) throw err
          t.end()
        })
      })
    })
  })
})

test('cleanup', (t) => {
  leveldown.destroy(dbPath, (err) => {
    t.ifError(err, 'err should not exist')
    t.end()
  })
})
