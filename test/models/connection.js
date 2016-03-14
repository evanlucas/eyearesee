'use strict'

const test = require('tap').test
const Connection = require('../../lib/models/connection')
const Channel = require('../../lib/models/channel')
const Settings = require('../../lib/models/connection-settings')
const auth = require('../../lib/auth')
const IRC = require('../../lib/irc')
const db = require('../../lib/db')

test('Connection', (t) => {
  t.plan(14)

  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , password: 'test'
    , realname: 'Test'
    }
  , channels: [
      {
        type: 'channel'
      , name: '#node.js'
      , autoJoin: true
      }
    ]
  , privateMessages: [
      {
        type: 'private'
      , name: 'evanlucas'
      , autoJoin: true
      }
    ]
  }

  const saveCreds = auth.saveCreds
  auth.saveCreds = function(n, u, p) {
    auth.saveCreds = saveCreds
    t.equal(n, 'Freenode', 'name is correct')
    t.equal(u, 'test', 'username is correct')
    t.equal(p, 'test', 'password is correct')
  }

  let conn = Connection(opts, app)
  t.equal(conn.connected, false, 'connected is false')
  t.deepEqual(conn.logs, [], 'logs is empty array')
  t.equal(conn.active, false, 'active is false')
  t.equal(conn.ele, '.logs-container', 'ele is correct')
  t.equal(conn.channels.size, 1, 'channels.size === 0')
  t.equal(conn.privateMessages.size, 1, 'privateMessages.size === 0')
  t.equal(conn._autoJoins.size, 1, '_autoJoins.size === 0')
  t.equal(conn.host, '127.0.0.1', 'host is correct')
  t.equal(conn.port, 6667, 'port is correct')
  t.type(conn.irc, IRC)
  t.type(conn.settings, Settings)

  t.end()
})

test('Connection#persist', (t) => {
  t.plan(4)
  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , password: 'test'
    , altnick: 'Test'
    , realname: 'Test'
    }
  , channels: [
      {
        type: 'channel'
      , name: '#node.js'
      , autoJoin: true
      , topic: ''
      }
    ]
  , privateMessages: [
      {
        type: 'private'
      , name: 'evanlucas'
      , autoJoin: true
      , topic: ''
      }
    ]
  }

  const saveCreds = auth.saveCreds
  auth.saveCreds = function() {
    t.pass('called saveCreds')
    auth.saveCreds = saveCreds
  }

  const persist = db.persistConnection
  db.persistConnection = function(obj, cb) {
    db.persistConnection = persist
    t.pass('called db.persistConnection')
    t.deepEqual(obj, {
      name: 'Freenode'
    , host: '127.0.0.1'
    , port: 6667
    , user: {
        username: 'test'
      , nickname: 'test'
      , altnick: 'Test'
      , realname: 'Test'
      }
    , autoConnect: true
    , logLocation: null
    , logTranscripts: false
    , showEvents: true
    , channels: [
        {
          type: 'channel'
        , name: '#node.js'
        , autoJoin: true
        , topic: ''
        }
      ]
    , privateMessages: [
        {
          type: 'private'
        , name: 'evanlucas'
        , autoJoin: true
        , topic: ''
        }
      ]
    , partMsg: 'eyearesee https://github.com/evanlucas/eyearesee'
    }, 'obj is correct')
    cb()
  }

  let conn = new Connection(opts, app)
  conn.persist((err) => {
    t.ifError(err, 'err should not exist')
  })
})

test('Connection#updateMyNick', (t) => {
  t.plan(4)
  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , password: 'test'
    , altnick: 'Test'
    , realname: 'Test'
    }
  , channels: [
      {
        type: 'channel'
      , name: '#node.js'
      , autoJoin: true
      , topic: ''
      }
    ]
  , privateMessages: [
      {
        type: 'private'
      , name: 'evanlucas'
      , autoJoin: true
      , topic: ''
      }
    ]
  }

  const saveCreds = auth.saveCreds
  auth.saveCreds = function() {
    t.pass('called saveCreds')
    auth.saveCreds = saveCreds
  }

  let conn = Connection(opts, app)

  const chan = conn.channels.get('#node.js')
  if (!chan)
    throw new Error('Expected to find channel')

  const newNick = 'biscuits'

  const update = chan.updateMyNick
  chan.updateMyNick = function(nick) {
    chan.updateMyNick = update
    t.equal(nick, newNick, 'nick === biscuits')
  }

  t.equal(conn.user.nickname, 'test', 'old nick is correct')
  conn.updateMyNick(newNick)
  t.equal(conn.user.nickname, newNick, 'new nick is correct')
})

test('Connection#join', (t) => {
  t.plan(6)
  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , altnick: 'Test'
    , realname: 'Test'
    }
  }

  let conn = Connection(opts, app)
  const _join = conn._join
  const exp = {
    '#node.js': undefined
  , '#node-dev': undefined
  , '#libuv': undefined
  , '#private': 'a'
  , '#priv2': 'b'
  , '#priv3': undefined
  }

  conn._join = function(name, key) {
    if (!exp.hasOwnProperty(name)) {
      t.fail(`unexpected name passed to join ${name}`)
    } else {
      t.equal(exp[name], key, `called join for name: ${name} key: ${key}`)
    }
  }

  conn.join(['#node.js'])
  conn.join(['#node-dev', '#libuv'])
  conn.join(['#private'], ['a'])
  conn.join(['#priv2', '#priv3'], ['b'])

  conn._join = _join
})

test('Connection#_join', (t) => {
  t.plan(3)
  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , altnick: 'Test'
    , realname: 'Test'
    }
  }

  let conn = Connection(opts, app)

  const addChannel = conn.addChannel
  conn.addChannel = function(obj) {
    conn.addChannel = addChannel
    t.deepEqual(obj, {
      name: '#test'
    , topic: null
    , nick: 'test'
    , messages: []
    , unread: 0
    }, 'addChannel is called with correct properties')
  }

  const join = conn.irc.join
  conn.irc.join = function(name, key) {
    conn.irc.join = join
    t.equal(name, '#test', 'name === #test')
    t.equal(key, undefined, 'key === undefined')
  }

  conn._join('#test')
})

test('Connection#disconnect', (t) => {
  t.plan(3)
  const app = {
    nav: {}
  , needsLayout: function() {}
  }

  const opts = {
    name: 'Freenode'
  , host: '127.0.0.1'
  , port: 6667
  , user: {
      username: 'test'
    , nickname: 'test'
    , altnick: 'Test'
    , realname: 'Test'
    }
  }

  let conn = Connection(opts, app)

  const disc = conn.irc.disconnect
  conn.irc.disconnect = function(cb) {
    conn.irc.disconnect = disc
    t.pass('called conn.irc.disconnect')
    cb()
  }

  const log = conn.log
  conn.log = function(obj) {
    conn.log = log
    t.match(obj, {
      type: 'message'
    , from: ''
    , message: 'Disconnected'
    , ts: /(.*)/
    }, 'log message should match')
  }

  conn.disconnect((err) => {
    t.ifError(err, 'err should not exist')
  })
})

test('Connection#log')
