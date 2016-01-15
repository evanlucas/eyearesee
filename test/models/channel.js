'use strict'

const test = require('tap').test
const Channel = require('../../lib/models/channel')
const User = require('../../lib/models/user')

test('Channel - type channel', (t) => {
  const conn = {}

  const opts = {
    name: '#Node.js'
  , topic: 'This is the topic'
  , nick: 'evan'
  , messages: []
  , unread: 0
  , type: 'channel'
  , autoJoin: false
  , from: null
  , connection: conn
  }

  const chan = Channel(opts)

  t.equal(chan.name, '#Node.js', 'name is correct')
  t.equal(chan.topic, 'This is the topic', 'topic is correct')
  t.equal(chan.nick, 'evan', 'nick is correct')
  t.deepEqual(chan.messages, [], 'messages is empty array')
  t.equal(chan.unread, 0, 'unread is correct')
  t.equal(chan.type, 'channel', 'type is correct')
  t.equal(chan.autoJoin, false, 'autoJoin is correct')
  t.equal(chan.from, null, 'from is correct')
  t.equal(chan._connection, conn, '_connection is correct')
  t.equal(chan.ele, '.channel-container', 'ele is correct')
  t.equal(chan.active, false, 'active is correct')
  t.type(chan.colorMap, Map)
  t.type(chan.users, Map)
  t.type(chan.names, Array)
  t.type(chan._onlyNames, Array)
  t.deepEqual(chan.toJSON(), {
    name: '#Node.js'
  , type: 'channel'
  , topic: 'This is the topic'
  , autoJoin: false
  }, 'toJSON works')
  t.end()
})

test('Channel - type private', (t) => {
  const conn = {
    user: {
      nickname: 'evan'
    , username: 'evan'
    , address: 'unaffiliated/evan'
    , realname: 'Evan'
    , color: 'green'
    }
  , whois: function(from, cb) {
      t.pass('called whois')
      cb(null, {
        nickname: 'from'
      , username: 'from'
      })
    }
  , app: {
      nav: {}
    }
  }

  const opts = {
    name: '#Node.js'
  , topic: 'This is the topic'
  , nick: 'evan'
  , messages: []
  , unread: 0
  , type: 'private'
  , autoJoin: false
  , from: 'from'
  , connection: conn
  }

  const chan = Channel(opts)

  t.equal(chan.name, '#Node.js', 'name is correct')
  t.equal(chan.topic, 'This is the topic', 'topic is correct')
  t.equal(chan.nick, 'evan', 'nick is correct')
  t.deepEqual(chan.messages, [], 'messages is empty array')
  t.equal(chan.unread, 0, 'unread is correct')
  t.equal(chan.type, 'private', 'type is correct')
  t.equal(chan.autoJoin, false, 'autoJoin is correct')
  t.equal(chan.from, 'from', 'from is correct')
  t.equal(chan._connection, conn, '_connection is correct')
  t.equal(chan.ele, '.channel-container', 'ele is correct')
  t.equal(chan.active, false, 'active is correct')
  t.type(chan.colorMap, Map)
  t.type(chan.users, Map)
  t.type(chan.names, Array)
  t.type(chan._onlyNames, Array)
  t.equal(chan.users.size, 2, 'users.size is 2')
  t.equal(chan.names.length, 2, 'names.length is 2')
  t.equal(chan._onlyNames.length, 2, '_onlyNames.length is 2')

  // let's try adding the from user again
  const fromUser = chan.users.get('from')
  const out = chan._addUser({
    nickname: 'from'
  })

  t.equal(out, fromUser)

  chan.removeUser('from')
  t.equal(chan.users.size, 1, 'user.size is 1')
  t.equal(chan.names.length, 1, 'names.length is 1')
  t.equal(chan._onlyNames.length, 1, '_onlyNames.length is 1')
  t.end()
})

test('methods', (t) => {
  t.plan(17)
  const conn = {
    render: function() {
      t.pass('called render')
    }
  , removeChannel: function() {}
  , app: {
      nav: {
        current: null
      }
    }
  , irc: {
      send: function(n, d) {
        t.pass('called send')
      }
    , action: function(n, d) {
        t.pass('called action')
      }
    }
  }

  const opts = {
    name: '#Node.js'
  , topic: 'This is the topic'
  , nick: 'evan'
  , messages: []
  , unread: 0
  , type: 'channel'
  , autoJoin: false
  , from: null
  , connection: conn
  }

  const chan = Channel(opts)
  conn.app.nav.current = chan

  // adds a message
  chan.updateMyNick('tester')
  t.equal(chan.messages.length, 1, 'messages.length === 1')
  const msg1 = chan.messages[0]
  t.equal(msg1.message, 'You are now known as tester')
  t.equal(msg1.type, 'info')

  // destroy
  // should return false for a channel type
  t.equal(chan.destroy(), false, 'destroy returns false')

  // send
  chan.send('Hello')
  t.equal(chan.messages.length, 2, 'messages.length === 2')
  const msg2 = chan.messages[1]
  t.equal(msg2.message, 'Hello')
  t.equal(msg2.type, 'message')
  t.equal(msg2.to, '#Node.js')
  t.equal(msg2.from, 'tester')

  // action
  chan.action('this is an action')
  t.equal(chan.messages.length, 3, 'messages.length === 3')
  const msg3 = chan.messages[2]
  t.equal(msg3.message, 'this is an action')
  t.equal(msg3.type, 'action')
  t.equal(msg3.to, '#Node.js')
  t.equal(msg3.from, 'tester')

//  t.end()
})
