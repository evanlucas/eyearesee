'use strict'

const test = require('tap').test
const ChannelView = require('../../lib/views/channel')
const IRC = require('eyearesee-client')
const Channel = IRC.Channel
const Settings = IRC.Settings
const UserbarView = require('../../lib/views/userbar')
const MessageView = require('../../lib/views/message-log')

test('ChannelView', (t) => {
  const app = {
    settings: new Settings()
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
  , connection: {
      settings: {
        get: () => {}
      }
    , app: app
    , emit: () => {}
    , channels: new Map()
    }
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
  t.equal(header.tagName, 'IRC-HEADER')
  t.deepEqual(header.properties, {
    className: 'pure-g'
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
  t.equal(title.children[0].text, '#Node.js')

  const container = out[1]
  t.equal(container.tagName, 'DIV')
  t.equal(container.properties.className, 'channel-container userbar-shown')

  t.equal(container.children.length, 2)
  t.equal(container.children[0].tagName, 'UL')
  t.equal(container.children[0].properties.className, 'logs')
  t.equal(container.children[1].tagName, 'IRC-USERBAR')

  t.end()
})
