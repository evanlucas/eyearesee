'use strict'

module.exports = Settings

function Settings(db) {
  if (!(this instanceof Settings))
    return new Settings(db)

  this._map = new Map()

  if (!db)
    throw new Error('db is required')

  // This allows us to make this a general settings class
  this.db = db
}

Settings.prototype.load = function load(cb) {
  this._load((err, data) => {
    if (err) return cb(err)
    this._map = data
    cb()
  })
}

Settings.prototype.get = function get(key) {
  return this._map.get(key)
}

Settings.prototype.set = function set(key, val, cb) {
  const ret = this._map.set(key, val)
  this.db.put(key, val, (err) => {
    if (err) return cb(err)
    cb(null, ret)
  })
}

Settings.prototype.del = function del(key, cb) {
  const ret = this._map.delete(key)
  this.db.del(key, (err) => {
    if (err) return cb(err)
    cb(null, ret)
  })
}

// Loads the settings from the db
// function(err, Map) is cb signature
Settings.prototype._load = function _load(cb) {
  const data = new Map()
  let called = false
  this.db.createReadStream()
    .on('data', (item) => {
      data.set(item.key, item.value)
    })
    .on('error', done)
    .on('close', done)

  function done(err) {
    if (called) return
    called = true
    cb(err, data)
  }
}
