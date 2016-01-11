'use strict'

const EE = require('events')
const inherits = require('util').inherits
const levelup = require('levelup')
const leveldown = require('leveldown')
const subleveldown = require('subleveldown')
const debug = require('debug')('eyearesee:db')

module.exports = new DB()

function DB() {
  if (!(this instanceof DB))
    return new DB()

  EE.call(this)
  this._db = levelup('./eyearesee', {
    db: leveldown
  , valueEncoding: 'json'
  })

  const db = this._db
  this.connections = db.connections = subleveldown(db, 'connections', {
    valueEncoding: 'json'
  })
}
inherits(DB, EE)

DB.prototype.persistConnection = function persistConnection(obj, cb) {
  debug('persist connection')
  this.connections.put(obj.name.toLowerCase(), obj, cb)
}

DB.prototype.removeConnection = function removeConnection(name, cb) {
  debug('removeConnection %s', name)
  this.connections.del(name.toLowerCase(), cb)
}

DB.prototype.getConnections = function getConnections(cb) {
  const data = []
  var count = 0
  this.connections.createReadStream()
    .on('data', (item) => {
      debug('item %s', item.key)
      // item.key, item.value
      data.push(item.value)
    })
    .on('error', (err) => {
      console.error(err.stack)
      done(err)
    })
    .on('end', () => {
      debug('end')
      done()
    })
    .on('close', () => {
      debug('close')
      done()
    })

  function done(err) {
    if (count) return
    count++
    cb(err, data)
  }
}

DB.prototype.getUser = function getUser(cb) {
  this.get('user', cb)
}

DB.prototype.getServer = function getServer(cb) {
  this.get('server', cb)
}

DB.prototype.get = function get(key, cb) {
  this._db.get(key, cb)
}

DB.prototype.put = function set(key, val, cb) {
  this._db.put(key, val, cb)
}

DB.prototype.batch = function batch(ar, cb) {
  this._db.batch(ar, cb)
}
