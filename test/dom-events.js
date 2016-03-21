'use strict'

const test = require('tap').test
const Events = require('../lib/dom-events')

test('Events', (t) => {
  t.ok(Events.hasOwnProperty('KEYS'), 'has KEYS')
  t.ok(Events.hasOwnProperty('NAV'), 'has NAV')
  t.equal(Events.KEYS.SLASH, 191)
  t.equal(Events.KEYS.DOWN, 40)
  t.equal(Events.isDOWN(40), true)
  t.equal(Events.isDOWN(41), false)

  t.equal(Events.isNav(40), true)
  t.equal(Events.isNav(Events.KEYS.SLASH), false)
  t.equal(Events.nameForCode(40), 'DOWN', 'nameForCode')
  t.end()
})
