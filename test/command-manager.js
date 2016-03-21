'use strict'

const test = require('tap').test
const Manager = require('../lib/command-manager')
const mapUtil = require('map-util')

test('Manager', (t) => {
  const manager = new Manager()
  t.type(manager.commands, Map)
  t.equal(manager._active, null)
  t.type(manager._names, Array)

  manager.addDefaults()
  t.equal(manager.commands.has('/action'), true, 'has /action command')

  let obj = manager.commands.get('/action')
  t.equal(manager.first(), obj, 'Manager#first()')
  obj = manager.next()

  // nothing is active, so get the first
  t.equal(obj, manager.commands.get('/action'), 'Manager#next()')
  t.equal(manager._active, obj, '_active')

  obj = manager.prev()
  const last = mapUtil.lastVal(manager.commands)
  t.equal(obj, last, 'Manager#prev()')

  t.throws(() => {
    manager.alias('biscuits', 'abc')
  }, /Cannot create alias. Original does not exist/)

  t.equal(manager.commands.get('abc'), undefined, 'command not present')

  obj = manager.next()
  obj = manager.next()
  t.equal(obj, manager.commands.get('/away'), 'Manager#next()')

  manager._active = null
  obj = manager.prev()
  t.equal(obj, manager.commands.get('/action'), 'Manager#prev')
  t.end()
})
