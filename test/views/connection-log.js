'use strict'

const test = require('tap').test
const ConnectionLog = require('../../lib/views/connection-log')
const utils = require('../../lib/utils')

test('ConnectionLogView', (t) => {
  const app = {
    nav: {}
  }

  const conn = new ConnectionLog(app)
  const d = new Date()
  const log = {
    ts: d
  , type: 'notice'
  , message: 'This is a test. https://github.com'
  , formatted: 'This is a test. <a href="https://github.com" class="external' +
    '-url external-url-url" target="_blank">github.com</a>'
  }

  const v = conn.render(log)

  t.equal(v.tagName, 'LI')
  t.deepEqual(v.properties, { className: 'notice' })
  const kids = v.children
  t.equal(kids.length, 2)
  t.equal(kids[0].tagName, 'SPAN')
  t.equal(kids[0].properties.className, 'ts')
  t.equal(kids[0].children[0].text, `[${utils.date(d)}]`)

  const con = kids[1]
  t.equal(con.tagName, 'SPAN')
  t.equal(con.properties.className, 'content')
  t.equal(con.properties.innerHTML,
    'This is a test. <a href="https://github.com" class="external-url ' +
    'external-url-url" target="_blank">github.com</a>'
  )

  t.end()
})
