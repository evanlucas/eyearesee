'use strict'

const test = require('tap').test
const utils = require('../lib/utils')

test('connectionLogLocation', (t) => {
  let conn = {
    settings: new Map([
      ['transcripts.enabled', true]
    , ['transcripts.location', '/tmp']
    ])
  , name: 'Freenode'
  }

  let out = utils.connectionLogLocation(conn)
  t.equal(out, '/tmp/Connections/Freenode/Console', 'result is correct')

  conn.settings.delete('transcripts.location')
  out = utils.connectionLogLocation(conn)
  t.equal(out, null, 'result is correct')

  conn.settings.set('transcripts.enabled', false)
  out = utils.connectionLogLocation(conn)
  t.equal(out, null, 'result is correct')

  t.end()
})

test('channelLogLocation', (t) => {
  const base = '/tmp/Connections/Freenode'
  let conn = {
    settings: new Map([
      ['transcripts.enabled', true]
    , ['transcripts.location', '/tmp']
    ])
  , name: 'Freenode'
  }

  let chan = {
    getConnection: () => {
      return conn
    }
  , type: 'channel'
  , name: '#node.js'
  }

  let out = utils.channelLogLocation(chan)
  t.equal(out, `${base}/Channels/#node.js`, 'result is correct')
  chan.type = 'private'

  out = utils.channelLogLocation(chan)
  t.equal(out, `${base}/Messages/#node.js`, 'result is correct')

  conn.settings.set('transcripts.enabled', false)
  out = utils.channelLogLocation(chan)
  t.equal(out, null, 'result is correct')
  t.end()
})

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

test('pad', (t) => {
  t.plan(2)
  t.equal(utils.pad(0), '00')
  t.equal(utils.pad(10), '10')
})

test('isValidChannel', (t) => {
  t.ok(utils.isValidChannel('#node.js'))
  t.ok(utils.isValidChannel('&node.js'))
  t.ok(utils.isValidChannel('!node.js'))
  t.notOk(utils.isValidChannel('~node.js'))
  t.notOk(utils.isValidChannel())
  t.end()
})

test('formatNameForType', (t) => {
  t.plan(6)
  t.equal(utils.formatNameForType('evan', 'action'), '● evan')
  t.equal(utils.formatNameForType('evan', 'message'), '<evan>')
  t.equal(utils.formatNameForType('evan', 'mention'), '<evan>')
  t.equal(utils.formatNameForType('evan', 'notice'), '«evan»')
  t.equal(utils.formatNameForType('evan', 'join'), '⇾ evan')
  t.equal(utils.formatNameForType('evan', 'part'), '⇽ evan')
})

test('encodeConnection', (t) => {
  t.plan(1)
  const name = '#node.js'
  const out = utils.encodeConnection(name)
  t.equal(out, `#server_____${name}`)
})

test('decodeConnection', (t) => {
  t.plan(1)
  const name = '#server_____#node.js'
  const out = utils.decodeConnection(name)
  t.equal(out, '#node.js')
})

test('processMessage', (t) => {
  const colors = new Map()
  colors.set('[diecast]', 'red')
  colors.set('evanlucas', 'blue')
  colors.set('esya|', 'green')
  let msg = 'this is a test'
  let out = utils.processMessage(msg, colors, null, new Map())
  t.equal(out, 'this is a test')

  msg = 'hi evanlucas: this is a test'
  out = utils.processMessage(msg, colors, null, new Map())
  t.equal(out, 'hi <span class="mention blue">evanlucas</span>: this is a test')
  t.end()
})
