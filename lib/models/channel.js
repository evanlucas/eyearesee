'use strict'

const Message = require('./message')
const User = require('./user')
const colors = require('../colors')
const debug = require('debug')('eyearesee:channel')

module.exports = Channel

function Channel(opts) {
  if (!(this instanceof Channel))
    return new Channel(opts)

  this.name = opts.name
  this.topic = opts.topic || ''
  this.nick = opts.nick || ''
  this.messages = opts.messages || []
  this.unread = opts.unread || 0
  this.type = opts.type || 'channel' // ['channel', 'private']
  this.active = false
  this.autoJoin = opts.hasOwnProperty('autoJoin')
    ? opts.autoJoin
    : true

  this.joined = false

  this.from = (opts.from || '').toLowerCase() || null
  this._connection = opts.connection
  this.ele = '.channel-container'

  this.colorMap = new Map()
  this.users = new Map()
  this.names = []

  this._onlyNames = []
  if (this.from && this.type === 'private') {
    // Add me as a user to the "channel"
    this._addOrUpdateUser(this._connection.user)

    // Go ahead and add the other user even though
    // we don't have all of the info. It will be updated
    // as soon as the following WHOIS query returns
    if (opts.from)
      this._addOrUpdateUser({ nickname: opts.from })

    this._connection.whois(this.from, (err, info) => {
      if (err) {
        console.error(err.stack)
      } else {
        this.addOrUpdateUser(info)
        if (this.isActive()) {
          this._connection.render()
        }
      }
    })
  }
  this.setNames()
}

Channel.prototype.isActive = function isActive() {
  const active = this._connection.app.nav.current
  return (active && active.name === this.name)
}

Channel.prototype.partAndDestroy = function partAndDestroy() {
  debug('part and destroy')
  if (this.joined) {
    this.part()
    this._connection.removeChannel(this.name)
  } else {
    this._connection.removeChannel(this.name)
  }
}

Channel.prototype.toJSON = function toJSON() {
  return {
    name: this.name
  , type: this.type
  , topic: this.topic
  , autoJoin: this.autoJoin
  //, messages: this.messages // need to map these
  }
}

Channel.prototype.updateMyNick = function updateMyNick(nick) {
  this.nick = nick
  this.addMessage({
    message: `You are now known as ${nick}`
  , type: 'info'
  , to: null
  , from: null
  , hostmask: null
  , ts: new Date()
  })

  if (this.isActive()) {
    this._connection.render()
  }
}

Channel.prototype.join = function join() {
  this._connection.irc.join(this.name)
}

Channel.prototype.part = function part() {
  this._connection.irc.part(this.name)
}

Channel.prototype.destroy = function destroy() {
  if (this.type !== 'private') {
    debug('destroying channel %s', this.name)
    this._connection.removeChannel(this.name)
    return false
  }

  debug('destroying private message %s', this.name)
  this._connection.removePrivateMessage(this.name)
  return true
}

Channel.prototype.send = function send(data) {
  this.addMessage({
    message: data
  , type: 'message'
  , to: this.name
  , from: this.nick
  , hostmask: null
  , ts: new Date()
  })

  debug('sending message %s', data)
  this._connection.irc.send(this.name, data)
}

Channel.prototype.action = function action(data) {
  this.addMessage({
    message: data
  , type: 'action'
  , to: this.name
  , from: this.nick
  , hostmask: null
  , ts: new Date()
  })

  debug('sending action %s', data)
  this._connection.irc.action(this.name, data)
}

Channel.prototype.addMessage = function addMessage(opts) {
  debug('add message (%d)', this.messages.length, opts)
  // TODO(evanlucas) Make this configurable on a per-channel
  // or per-connection basis
  if (this.messages.length > 300) {
    // shift off the first
    this.messages.shift()
  }

  const msg = new Message({
    message: opts.message
  , type: opts.type
  , to: opts.to
  , from: opts.from
  , hostmask: opts.hostmask
  , channel: this
  , ts: opts.ts || Date.now()
  })

  this.messages.push(msg)
  return msg
}

Channel.prototype.addUser = function addUser(opts) {
  const out = this._addUser(opts)
  this.setNames()
  return out
}

Channel.prototype.addOrUpdateUser = function addOrUpdateUser(opts) {
  const out = this._addOrUpdateUser(opts)
  this.setNames()
  return out
}

Channel.prototype._addOrUpdateUser = function _addOrUpdateUser(opts) {
  const nick = (opts.nickname || '').toLowerCase()
  if (!this.users.has(nick)) {
    debug('user does not exist...creating %s', nick)
    return this._addUser(opts)
  }

  const user = this.users.get(nick)
  // TODO(evanlucas) support users that change nicks
  user.username = opts.username
  if (opts.address)
    user.address = opts.address

  if (opts.realname)
    user.realname = opts.realname

  if (opts.mode)
    user.mode = opts.mode
}

Channel.prototype._addUser = function _addUser(opts) {
  const nick = (opts.nickname || '').toLowerCase()
  if (this.users.has(nick)) {
    return this.users.get(nick)
  }

  const user = new User({
    nickname: opts.nickname
  , username: opts.username
  , address: opts.address
  , realname: opts.realname
  , mode: opts.mode
  , color: opts.color || colors.nextColor()
  })

  this.colorMap.set(nick, user.color)
  this.users.set(nick, user)

  // update the userbar
  return user
}

Channel.prototype.removeUser = function removeUser(name) {
  debug('remove user %s', name)
  name = name.toLowerCase()
  this.colorMap.delete(name)
  this.users.delete(name)

  this.setNames()
  // update the userbar
}

Channel.prototype.setNames = function setNames() {
  const names = new Array(this.users.size)
  this._onlyNames = new Array(names.length)
  let i = 0
  for (const item of this.users.values()) {
    names[i] = {
      name: item.nickname
    , mode: item.mode
    }
    this._onlyNames[i] = item.nickname
    i++
  }

  this.names = names.sort(function(a, b) {
    if (a.mode === b.mode) {
      return a.name < b.name
        ? -1
        : a.name > b.name
        ? 1
        : 0
    }

    if (a.mode > b.mode) {
      return -1
    } else if (a.mode < b.mode) {
      return 1
    }

    return 0
  })
}
