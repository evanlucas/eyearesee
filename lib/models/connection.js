'use strict'

const debug = require('debug')('eyearesee:connection')
const Channel = require('./channel')
const Settings = require('./connection-settings')
const IRC = require('../irc')
const db = require('../db')
const auth = require('../auth')

module.exports = Connection

function Connection(opts, app) {
  if (!(this instanceof Connection))
    return new Connection(opts, app)

  this.connected = false
  this.settings = new Settings(opts, this)
  this.app = app

  this.irc = null

  this.logs = []
  this.channels = new Map()
  this.privateMessages = new Map()

  this.activeChannel = null
  this.active = false
  this.ele = '.logs-container'

  if (opts.user.password) {
    auth.saveCreds(this.name, opts.user.username, opts.user.password)
  }

  if (opts.channels && opts.channels.length) {
    const chans = opts.channels
    const len = chans.length
    for (var i = 0; i < len; i++) {
      const chan = chans[i]
      this.addChannel(chan)
    }
  }
}

Connection.prototype.persist = function persist(cb) {
  debug('persisting connection %s', this.name)
  // {
  //   name: 'Freenode'
  // , host: 'irc.freenode.org'
  // , port: 6667
  // , autoConnect: true
  // , user: {
  //     username: 'evanlucas'
  //   , realname: 'Evan Lucas'
  //   , nickname: 'evanlucas'
  //   , altnick: 'evanluca_'
  //   }
  // , channels: [
  //     {
  //       name: '#node.js'
  //     , type: 'channel'
  //     , autoJoin: true
  //     }
  //   , {
  //       name: 'evanluca_'
  //     , type: 'private'
  //     }
  //   ]
  // }

  const obj = {
    name: this.name
  , host: this.host
  , port: this.port
  , user: {
      // make sure we don't persist the user's password to the db
      // use the keychain for that instead
      username: this.user.username
    , realname: this.user.realname
    , nickname: this.user.nickname
    , altnick: this.user.altnick
    }
  , channels: []
  }

  for (const chan of this.channels.values()) {
    obj.channels.push(chan.toJSON())
  }

  for (const chan of this.privateMessages.values()) {
    obj.channels.push(chan.toJSON())
  }

  db.persistConnection(obj, cb)
}

Connection.prototype.connect = function connect() {
  debug('connect')
  this.irc = new IRC({
    server: {
      host: this.host
    , port: this.port
    }
  , user: this.user
  })

  this.irc.on('connect', (msg) => {
    this.connected = true
    debug('connected')
    this.log({
      type: 'connect'
    , from: ''
    , message: `Successfully connected to ${this.host}:${this.port}`
    , ts: new Date()
    , hostmask: null
    , channel: null
    })
  })

  this.irc.on('userNickChanged', (nick) => {
    this.log({
      type: 'nickchanged'
    , from: ''
    , message: `You are now known as ${nick}`
    , ts: new Date()
    , hostmask: null
    , channel: null
    })

    this.updateMyNick(nick)
  })

  this.irc.on('welcome', (nick) => {
    if (nick === this.user.nickname) {
      debug('nick is correct')
      return
    }

    this.log({
      type: 'nickchanged'
    , from: ''
    , message: `You are now known as ${nick}`
    , ts: new Date()
    , hostmask: null
    , channel: null
    })

    this.updateMyNick(nick)
  })

  this.irc.on('log', (msg) => {
    this.log(msg)
  })

  this.irc.on('topic', (msg) => {
    debug('topic', msg)
    const name = msg.channel.toLowerCase()
    const topic = msg.topic
    if (this.channels.has(name)) {
      const chan = this.channels.get(name)
      chan.topic = topic
      if (chan.isActive()) {
        this.render()
      }
    }
  })

  this.irc.on('notice', (msg) => {
    const to = (msg.to || '').toLowerCase()
    const from = msg.from
    if (this.channels.has(to)) {
      const chan = this.channels.get(to)
      chan.addMessage({
        type: 'notice'
      , message: msg.message
      , to: to
      , from: from
      , hostmask: msg.hostmask
      })

      // need to render only if we are looking at that channel
      if (chan.isActive()) {
        this.render()
      }
    }
  })

  this.irc.on('part', (msg) => {
    require('../handlers/part')(msg, this)
  })

  this.irc.on('quit', (msg) => {
    require('../handlers/quit')(msg, this)
  })

  this.irc.on('join', (msg) => {
    require('../handlers/join')(msg, this)
  })

  this.irc.on('names', (msg) => {
    require('../handlers/names')(msg, this)
  })

  this.irc.on('message', (msg) => {
    require('../handlers/message')(msg, this)
  })

  this.irc.on('errors', (msg) => {
    require('../handlers/errors')(msg, this)
  })

  this.irc.on('ircerror', (msg) => {
    require('../handlers/errors')(msg, this)
  })

  this.irc.on('who', (channel, msg) => {
    require('../handlers/who')(channel, msg, this)
  })

  this.irc.on('nick', (msg) => {
    require('../handlers/nick')(msg, this)
  })

  this.irc.on('who_end', (channel) => {
    const chan = this.channels.get(channel)
    if (chan && chan.isActive()) {
      debug('who_end...rendering')
      this.render()
    }
  })
}

Connection.prototype.updateMyNick = function updateMyNick(nick) {
  debug('update my nick %s', nick)

  this.user.nickname = nick

  for (const chan in this.channels.values()) {
    chan.updateMyNick(nick)
  }
}

Connection.prototype.join = function join(name) {
  debug('join %s', name)
  const chan = this.addChannel({
    name: name
  , topic: null
  , nick: this.user.nickname
  , messages: []
  , unread: 0
  })

  this.irc.join(name)
}

Connection.prototype.disconnect = function disconnect() {

}

Connection.prototype.log = function log(opts) {
  if (!opts.type) {
    throw new Error('opts.type is required')
  }

  this.logs.push({
    type: opts.type
  , from: opts.from
  , message: opts.message
  , ts: opts.ts || new Date()
  , channel: opts.channel
  })

  // now we need to trigger a render
  this.render()
}

Connection.prototype.addChannel = function addChannel(opts) {
  const name = opts.name.toLowerCase()
  if (this.channels.has(name)) {
    debug('add channel %s already exists', name)
    return this.channels.get(name)
  }

  const chan = new Channel({
    name: name
  , topic: opts.topic
  , nick: opts.nick
  , messages: opts.messages || []
  , unread: opts.unread || 0
  , connection: this
  , type: 'channel'
  })

  debug('adding channel', chan.name)
  this.channels.set(name, chan)
  // update view
  // by adding the channel to the sidebar
  this.render()
  return chan
}

Connection.prototype.showChannel = function showChannel(chan) {
  this.app.nav.showChannel(chan)
}

Connection.prototype.part = function part(name, msg) {
  if (!name) {
    const current = this.app.nav.current
    if (current) {
      name = current.name
    }
  }

  debug('part %s %s', name, msg)

  if (!name) return
  name = name.toLowerCase()

  // send the part message
  // but don't remove the channel until we receive the part response
  if (this.channels.has(name)) {
    if (msg) {
      this.irc.part(name, msg)
    } else {
      this.irc.part(name)
    }
  } else {
    debug('unable to find channel %s', name)
  }
}

Connection.prototype.removeChannel = function removeChannel(name) {
  const n = name.toLowerCase()
  if (!this.channels.has(n)) {
    debug('remove channel does not exist %s', n)
    return
  }

  this.channels.delete(n)
  // remove from the sidebar and destroy the container view
  // if this is the active view, then show the connections log
  this.render()
}

Connection.prototype.addPrivateMessage = function addPrivateMessage(opts) {
  const name = opts.name.toLowerCase()
  if (this.privateMessages.has(name)) {
    debug('add private message %s already exists', name)
    return this.privateMessages.get(name)
  }

  const msg = new Channel({
    name: name
  , topic: opts.topic
  , nick: opts.nick
  , messages: opts.messages || []
  , unread: opts.unread || 0
  , connection: this
  , type: 'private'
  })

  debug('adding private message', msg)
  this.privateMessages.set(name, msg)
  // update view by adding the private message to the sidebar
  this.render()
  return msg
}

Connection.prototype.handleNickChange = function handleNickChange(opts) {
  const from = opts.from
  const to = opts.to
  const hostmask = opts.hostmask

  for (const chan of this.channels.values()) {
    if (chan.users.has(from)) {
      const user = chan.users.get(from)
      debug('fixing user', user)
      user.nickname = to
      chan.users.delete(from)
      chan.users.set(to, user)
      chan.setNames()
      if (chan.isActive()) {
        this.render()
      }
    }
  }
}

Connection.prototype.render = function render() {
  this.app.needsLayout()
}