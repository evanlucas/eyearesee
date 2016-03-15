'use strict'

const debug = require('debug')('eyearesee:models:conn-settings')
const db = require('../db')
const pkg = require('../../package')

module.exports = Settings

const URL = pkg.repository.url
const NAME = pkg.name
const DEFAULT_PART_MESSAGE = `${NAME} ${URL}`

module.exports.DEFAULT_PART_MESSAGE = DEFAULT_PART_MESSAGE

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
  this.set('logLocation', opts.logLocation)
  this.set('partMsg', opts.partMsg || DEFAULT_PART_MESSAGE)

  this.url = `${conn.url}/settings`

  const autoConnect = opts.hasOwnProperty('autoConnect')
    ? opts.autoConnect
    : true
  this.set('autoConnect', autoConnect)

  const showEvents = opts.hasOwnProperty('showEvents')
    ? opts.showEvents
    : true

  this.set('showEvents', showEvents)

  const logTranscripts = opts.logTranscripts === true
  this.set('logTranscripts', logTranscripts)

  Object.defineProperty(this, 'active', {
    get: function() {
      return this._active
    }
  , set: function(val) {
      this.conn.active = val
      return this._active = val
    }
  })

  // TODO(evanlucas) Remove all of these
  // and only rely on using map.get/map.set
  Object.defineProperty(conn, 'name', getDescriptor(this, 'name'))
  Object.defineProperty(conn, 'host', getDescriptor(this, 'host'))
  Object.defineProperty(conn, 'port', getDescriptor(this, 'port'))
  Object.defineProperty(conn, 'user', getDescriptor(this, 'user'))
  Object.defineProperty(conn, 'autoConnect', getDescriptor(this, 'autoConnect'))
  Object.defineProperty(conn, 'showEvents', getDescriptor(this, 'showEvents'))
  Object.defineProperty(
    conn
  , 'logTranscripts'
  , getDescriptor(this, 'logTranscripts')
  )
  Object.defineProperty(conn, 'logLocation', getDescriptor(this, 'logLocation'))
  Object.defineProperty(conn, 'partMsg', getDescriptor(this, 'partMsg'))

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
  this.set('logTranscripts', obj.logTranscripts)
  if (obj.logTranscripts) {
    this.set('logLocation', obj.logLocation)
  }

  if (obj.logTranscripts && !obj.logLocation) {
    this.set('logTranscripts', false)
  }

  this.set('partMsg', obj.partMsg || DEFAULT_PART_MESSAGE)

  this.conn._setupLogging()

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
