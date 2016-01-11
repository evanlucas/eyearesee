'use strict'

const debug = require('debug')('eyearesee:models:settings')
const db = require('../db')

module.exports = Settings

function Settings(opts, conn) {
  if (!(this instanceof Settings))
    return new Settings(opts, conn)

  this._active = false
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

  Object.defineProperty(this, 'active', {
    get: function() {
      return this._active
    }
  , set: function(val) {
      this.conn.active = val
      return this._active = val
    }
  })

  Object.defineProperty(conn, 'name', getDescriptor(this, 'name'))
  Object.defineProperty(conn, 'host', getDescriptor(this, 'host'))
  Object.defineProperty(conn, 'port', getDescriptor(this, 'port'))
  Object.defineProperty(conn, 'user', getDescriptor(this, 'user'))
  Object.defineProperty(conn, 'autoConnect', getDescriptor(this, 'autoConnect'))
  Object.defineProperty(conn, 'showEvents', getDescriptor(this, 'showEvents'))

  this.opts = opts
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

Settings.prototype.update = function update(obj, cb) {
  var prevName = this.get('name')
  debug('prevName', prevName, obj)
  this.set('name', obj.name)
  this.set('host', obj.host)
  this.set('port', obj.port)
  this.set('autoConnect', obj.autoConnect)
  this.set('showEvents', obj.showEvents)
  const app = this.conn.app

  if (prevName.toLowerCase() !== obj.name.toLowerCase()) {
    debug('name changed...removing old connection', prevName, obj.name)
    app.renameConnection(this.conn, prevName)
    db.removeConnection(prevName.toLowerCase(), (err) => {
      if (err) {
        return cb(err)
      }

      this.conn.persist((err) => {
        if (err) {
          return cb(err)
        }

        this.conn.render()
        debug('persisted settings', this._map)
        cb()
      })
    })
  } else {
    this.conn.persist((err) => {
      if (err) {
        return cb(err)
      }

      this.conn.render()
      debug('persisted settings', this._map)
      cb()
    })
  }
}
