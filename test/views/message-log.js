'use strict'

const test = require('tap').test
const MessageLog = require('../../lib/views/message-log')
const Channel = require('../../lib/models/channel')
const utils = require('../../lib/utils')

test('MessageLogView', (t) => {
  const app = {
    nav: {}
  }

  const conn = new MessageLog(app)
  const d = new Date()

  const chan = new Channel({
    name: '#Node.js'
  , topic: 'This is the topic. https://github.com/nodejs/node'
  , nick: 'evanlucas'
  , messages: []
  , unread: 0
  , type: 'channel'
  , autoJoin: false
  , connection: {
      settings: {
        get: () => {}
      }
    }
  })

  const u1 = chan.addUser({
    nickname: 'evanlucas'
  , username: 'evanlucas'
  , address: 'biscuits.local'
  , realname: 'Evan Lucas'
  , mode: '@'
  , color: 'green'
  })

  const u2 = chan.addUser({
    nickname: 'evanlucas2'
  , username: 'evanlucas2'
  , address: 'biscuits.local'
  , realname: 'Evan Biscuits'
  , mode: ''
  , color: 'red'
  })

  const log = chan.addMessage({
    message: 'Hi evanlucas. https://gist.github.com/evanlucas/' +
      '07e4771bbf7a83ca3b16'
  , type: 'message'
  , to: chan.name
  , from: 'evanlucas2'
  , hostmask: {}
  , ts: d
  })

  const v = conn.render(log, chan)

  t.equal(v.tagName, 'LI')
  t.deepEqual(v.properties, {
    className: 'message'
  })
  const kids = v.children
  t.equal(kids.length, 3)
  t.equal(kids[0].tagName, 'SPAN')
  t.equal(kids[0].properties.className, 'ts')
  t.equal(kids[0].children[0].text, `[${utils.date(d)}]`)

  const from = kids[1]
  t.equal(from.tagName, 'SPAN')
  t.deepEqual(from.properties, {
    className: 'username red'
  })
  t.equal(from.children.length, 1)
  t.equal(from.children[0].text, '<evanlucas2>')

  const msg = kids[2]
  t.equal(msg.tagName, 'SPAN')
  t.equal(msg.properties.className, 'content')
  t.equal(
    msg.properties.innerHTML
  , 'Hi <span class="mention green">evanlucas</span>. <a href="https://gist.' +
    'github.com/evanlucas/07e4771bbf7a83ca3b16" class="external-url external-' +
    'url-url" target="_blank">gist.github.com/evanlucas/07e4771bbf7a83ca3b16' +
    '</a>'
  )

  t.end()
})
