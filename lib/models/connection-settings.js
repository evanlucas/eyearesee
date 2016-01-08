'use strict'

module.exports = Settings

function Settings(opts, conn) {
  if (!(this instanceof Settings))
    return new Settings(opts, conn)

  this.conn = conn
  this._map = new Map()
  this.set('name', opts.name || opts.host)
  this.set('host', opts.host)
  this.set('port', opts.port)
  this.set('user', opts.user)
  const autoConnect = opts.hasOwnProperty('autoConnect')
    ? opts.autoConnect
    : true
  this.set('autoConnect', autoConnect)

  const showEvents = opts.hasOwnProperty('showEvents')
    ? opts.showEvents
    : true

  this.set('showEvents', showEvents)

  Object.defineProperty(conn, 'name', getDescriptor(this, 'name'))
  Object.defineProperty(conn, 'host', getDescriptor(this, 'host'))
  Object.defineProperty(conn, 'port', getDescriptor(this, 'port'))
  Object.defineProperty(conn, 'user', getDescriptor(this, 'user'))
  Object.defineProperty(conn, 'autoConnect', getDescriptor(this, 'autoConnect'))
  Object.defineProperty(conn, 'showEvents', getDescriptor(this, 'showEvents'))

  this.opts = opts
  this.active = false
}

function getDescriptor(self, name) {
  return {
    get: function() {
      return self._map.get(name)
    }
  , set: function(val) {
      return self._map.set(name, val)
    }
  }
}

Settings.prototype.get = function get(key) {
  return this._map.get(key)
}

Settings.prototype.set = function set(key, val) {
  return this._map.set(key, val)
}
