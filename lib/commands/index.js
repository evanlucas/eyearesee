'use strict'

const Command = require('./command')
const mapUtil = require('map-util')

module.exports = Manager

function Manager() {
  this.commands = new Map()
  this._active = null
  this._names = []
}

Manager.prototype.add = function add(name, desc, args) {
  const cmd = new Command(name, desc, args)
  this.commands.set(name, cmd)
  this._names.push(name)
  this._names.sort()
}

Manager.prototype.alias = function alias(name, orig) {
  const obj = this.commands.get(orig)
  if (!obj)
    throw new Error('Cannot create alias. Original does not exist')

  this.add(name, obj.description, obj.args)
}

Manager.prototype.addDefaults = function addDefaults() {
  this.add('/action', 'Send action to target', '[target] [msg]')
  this.add('/away', 'Set away status', '[away msg]')
  this.add('/invite', 'Invite user to channel', '<nick> <channel>')
  this.add('/join', 'Join a channel', '([channel[,channel]], [key[,key]]) || 0')
  this.add('/kick', 'Kick user from channel', '<channel> <user>')
  this.add('/leave', 'Leave a channel', '[channel] [msg]')
  this.add('/list', 'List channels', '[filter]')
  this.alias('/me', '/action')
  this.add('/mode', 'Set mode for target', '<nickname|channel> <mode>')
  this.add('/motd', 'Get the MOTD for the target', '[target]')
  this.add('/msg', 'Send message to target', '[nickname|channel] [msg]')
  this.add('/nick', 'Set/change your nickname', '<nickname>')
  this.add('/notice', 'Send notice to target', '[nickname|channel] [msg]')
  this.alias('/part', '/leave')
  this.add('/quit', 'Terminate session', '[msg]')
  this.add('/topic', 'Set/remove a channel\'s topic', '[channel] [topic]')
}

Manager.prototype.first = function first() {
  return mapUtil.firstVal(this.commands)
}

Manager.prototype.next = function next() {
  const active = this._active
  if (!active) {
    const item = mapUtil.firstVal(this.commands)
    if (item) {
      this._setActive(item)
    }
    return item
  } else {
    const item = mapUtil.nextVal(active, this.commands, true) // wrap
    if (item) {
      this._setActive(item)
    }
    return item
  }
}

Manager.prototype.prev = function prev() {
  const active = this._active
  if (!active) {
    const item = mapUtil.firstVal(this.commands)
    if (item) {
      this._setActive(item)
    }
    return item
  } else {
    const item = mapUtil.prevVal(active, this.commands, true) // wrap
    if (item) {
      this._setActive(item)
    }
    return item
  }
}

Manager.prototype._setActive = function _setActive(item) {
  const active = this._active
  if (active) {
    active.active = false
  }
  item.active = true
  this._active = item
}
