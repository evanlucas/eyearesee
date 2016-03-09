'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const debug = require('debug')('eyearesee:logger')
const utils = require('./utils')

module.exports = Logger

function Logger(opts) {
  if (!(this instanceof Logger))
    return new Logger(opts)

  this.base = opts.path
  this.fp = this.getFilePath()
  this.stream = null
}

Logger.prototype._createStream = function _createStream(cb) {
  mkdirp(path.dirname(this.fp), (err) => {
    if (err) return cb && cb(err)
    this.stream = fs.createWriteStream(this.fp, {
      flags: 'a'
    })

    cb && cb()
  })
}

Logger.prototype.getFilePath = function getFilePath() {
  const d = new Date()
  const year = d.getFullYear()
  const month = utils.pad(d.getMonth() + 1)
  const date = utils.pad(d.getDate())
  const filename = `${year}-${month}-${date}.txt`
  return path.join(this.base, filename)
}

Logger.prototype.write = function write(data) {
  if (!this.stream) {
    return this._createStream(() => {
      this.write(data)
    })
  }

  const fp = this.getFilePath()
  if (fp !== this.fp) {
    this.fp = fp
    this.close(() => {
      this._createStream(() => {
        this.stream.write(data + '\n')
      })
    })
  } else {
    this.stream.write(data + '\n')
  }
}

Logger.prototype.close = function close(cb) {
  debug('closing logger %s', this.fp)
  if (!this.stream) {
    return setImmediate(() => {
      cb && cb()
    })
  }
  this.stream.close(cb)
}
