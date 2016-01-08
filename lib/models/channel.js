'use strict'

const Message = require('./message')
const User = require('./user')
const colors = require('./colors')
const debug = require('debug')('eyearesee:channel')

module.exports = Channel

function Channel(opts) {
  if (!(this instanceof Channel))
    return new Channel(opts)

  this.name = opts.name.toLowerCase()
  this.topic = opts.topic || ''
  this.nick = opts.nick || ''
  this.messages = opts.messages || []
  this.unread = opts.unread || 0
  this.type = opts.type || 'channel' // ['channel', 'private']
  this.active = false
  this.autoJoin = opts.hasOwnProperty('autoJoin')
    ? opts.autoJoin
    : true
  this._connection = opts.connection
  this.ele = '.channel-container'

  this.colorMap = new Map()
  this.users = new Map()
  this.names = []

  this._onlyNames = []
  this.setNames()
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

Channel.prototype.send = function send(data) {
  const msg = this.addMessage({
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

Channel.prototype.addMessage = function addMessage(opts) {
  debug('add message', opts)
  const msg = new Message({
    message: opts.message
  , type: opts.type
  , to: opts.to
  , from: opts.from
  , hostmask: opts.hostmask
  , channel: this
  , ts: Date.now()
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
  const nick = opts.nickname
  if (!this.users.has(nick)) {
    debug('user does not exist...creating')
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
  if (this.users.has(opts.nickname)) {
    return this.users.get(opts.nickname)
  }

  const user = new User({
    nickname: opts.nickname
  , username: opts.username
  , address: opts.address
  , realname: opts.realname
  , mode: opts.mode
  , color: opts.color || colors.nextColor()
  })

  this.colorMap.set(user.nickname, user.color)
  this.users.set(user.nickname, user)

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
  debug('setNames')
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
  })
}
