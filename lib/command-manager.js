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
