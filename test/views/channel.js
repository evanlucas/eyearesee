'use strict'

const test = require('tap').test
const ChannelView = require('../../lib/views/channel')
const Channel = require('../../lib/models/channel')
const UserbarView = require('../../lib/views/userbar')
const MessageView = require('../../lib/views/message-log')

test('ChannelView', (t) => {
  const app = {
    nav: {}
  }

  const chan = ChannelView(app)
  t.type(chan, ChannelView)
  t.type(chan.ub, UserbarView)
  t.type(chan.message, MessageView)

  const c = new Channel({
    name: '#Node.js'
  , topic: 'This is the topic. https://github.com/nodejs/node'
  , nick: 'evanlucas'
  , messages: []
  , unread: 0
  , type: 'channel'
  , autoJoin: false
  , connection: {}
  })

  c.addMessage({
    message: 'this is a test'
  , type: 'msg'
  , to: null
  , from: 'evanlucas'
  , hostname: {}
  })

  const out = chan.render(c)
  t.type(out, Array)
  t.equal(out.length, 2, 'should have 2 objects')
  const header = out[0]
  t.equal(header.tagName, 'DIV')
  t.deepEqual(header.properties, {
    id: 'header'
  , className: 'pure-g'
  })

  const headerKids = header.children
  t.equal(headerKids.length, 1, 'header.children has 1 object')
  const headerKid = headerKids[0]
  t.deepEqual(headerKid.properties, {
    className: 'pure-u-1-1'
  })

  const hhkids = headerKid.children
  t.equal(hhkids.length, 2, 'header.children[0].children has 2 objects')

  const title = hhkids[0]
  t.equal(title.tagName, 'H2')
  t.deepEqual(title.properties, {
    className: 'title'
  })

  t.equal(title.children.length, 1)
  t.equal(title.children[0].text, '#node.js')

  const container = out[1]
  t.equal(container.tagName, 'DIV')
  t.deepEqual(container.properties, {
    className: 'channel-container'
  })

  t.equal(container.children.length, 2)
  t.equal(container.children[0].tagName, 'UL')
  t.equal(container.children[0].properties.className, 'logs')
  t.equal(container.children[1].tagName, 'DIV')
  t.equal(container.children[1].properties.id, 'userbar')

  t.end()
})
