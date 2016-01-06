'use strict'

const EE = require('events')
const inherits = require('util').inherits
const levelup = require('levelup')
const leveldown = require('leveldown')
const subleveldown = require('subleveldown')

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
  db.servers = subleveldown(db, 'servers', {
    valueEncoding: 'json'
  })
}
inherits(DB, EE)

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
