'use strict'

const test = require('tap').test
const IRC = require('../lib/irc')
const Duplex = require('stream').Duplex
const Slate = require('slate-irc')

let irc
let stream

test('setup', (t) => {
  irc = IRC({
    server: {
      host: '127.0.0.1'
    , port: 6667
    }
  , user: {
      password: 'password'
    , nickname: 'nickname'
    , username: 'username'
    , altnick: 'nickname2'
    , realname: 'realname'
    }
  })

  t.end()
})

test('_setupClient', (t) => {
  stream = new Duplex({
    readableObjectMode: true
  , writeableObjectMode: true
  , read: function(n) {}
  , write: function(chunk, enc, cb) {
      if (chunk.slice(0, 4) === 'USER') {
        t.equal(chunk, 'USER username 0 * :realname', 'USER')
      }
    }
  })

  stream.setEncoding('utf8')
  stream.setDefaultEncoding('utf8')

  irc.stream = stream

  let passOrig = Slate.prototype.pass
  let nickOrig = irc.nick
  Slate.prototype.pass = function(p) {
    Slate.prototype.pass = passOrig
    t.pass('called irc.client.pass')
  }

  irc.nick = function(nick) {
    irc.nick = nickOrig
    t.equal(nick, 'nickname', 'nickname is equal')
    t.pass('called irc.nick')
  }

  irc._setupClient()

  irc.once('notice', (msg) => {
    t.pass('got notice message')
  })

  irc.once('authenticated', () => {
    t.pass('got authenticated event')
  })

  irc.once('log', (msg) => {
    t.pass('got log event')
  })

  irc.client.emit('notice', {
    from: 'NickServ'
  , message: 'You are now identified for username'
  , hostmask: {}
  , to: null
  })

  irc.once('welcome', (m) => {
    t.pass('got welcome event')
    t.equal(m, 'Welcome to Freenode', 'message')
  })

  irc.once('log', (m) => {
    t.equal(m.type, 'welcome', 'type')
    t.equal(m.message, 'Welcome Welcome to Freenode', 'message')
  })

  irc.client.emit('welcome', 'Welcome to Freenode')

  irc.client.once('motd', (m) => {
    t.pass('got motd event')
  })

  const motd = [
    'Welcome'
  , 'This is'
  , 'the MOTD'
  ]

  let count = 0

  const motdHandler = (m) => {
    t.equal(m.message, motd[count])
    count++
    if (count === motd.length) irc.removeListener('log', motdHandler)
  }

  irc.on('log', motdHandler)

  irc.client.emit('motd', {
    motd: motd
  })

  irc.once('userNickChanged', () => {
    t.pass('got userNickChanged event')
  })

  irc.once('nick', () => {
    t.pass('got nick event')
  })

  irc.client.me = 'nickname'

  irc.client.emit('nick', {
    nick: 'nickname'
  , new: 'biscuits'
  })

  function testEvent(ev) {
    irc.once(ev, () => {
      t.pass(`got ${ev} event`)
    })

    irc.client.emit(ev, {})
  }

  testEvent('errors')
  testEvent('topic')
  testEvent('names')
  testEvent('mode')
  testEvent('part')
  testEvent('quit')
  testEvent('message')
  testEvent('join')

  function testDataEvent(cmd, ev) {
    ev = ev || cmd
    irc.once(ev, () => {
      t.pass(`got ${ev} event`)
    })
    irc.client.emit('data', {
      command: cmd
    })
  }

  testDataEvent('RPL_LISTSTART')
  testDataEvent('RPL_LIST')
  testDataEvent('RPL_LISTEND')
  testDataEvent('ERROR', 'ircerror')

  irc.nick = function(n) {
    irc.nick = nickOrig
    t.equal(n, 'nickname2', 'nick is correct')
  }

  irc.client.emit('data', {
    command: 'ERR_NICKNAMEINUSE'
  , params: 'newnick nickname'
  })

  t.end()
})

function methodTest(name) {
  test(`IRC#${name}`, (t) => {
    t.plan(1)
    irc.connected = false

    const orig = irc.client[name]
    irc.client[name] = function() {
      irc.client[name] = orig
      t.pass(`called client#${name}()`)
    }

    irc[name]()
    irc.connected = true
    irc.emit('connect')
  })
}

test('IRC Methods', (t) => {
  methodTest('nick')
  methodTest('invite')
  methodTest('send')
  methodTest('action')
  methodTest('notice')
  methodTest('join')
  methodTest('names')
  methodTest('topic')
  methodTest('kick')
  methodTest('oper')
  methodTest('mode')
  methodTest('quit')

  t.end()
})
