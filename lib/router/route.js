'use strict'

const pathToRE = require('path-to-regexp')
const URL = require('url')

module.exports = class Route {
  constructor(path, fn) {
    this.path = path
    this.fn = fn

    this._keys = []
    this.regexp = pathToRE(path, this._keys)
    this.keys = this._keys.map((item) => {
      return item.name
    })

    this.params = this._keys.reduce((set, item) => {
      set[item.name] = undefined
      return set
    }, {})
  }

  match(url) {
    const matches = this.regexp.exec(url)
    if (!matches) {
      return null
    }

    const keys = this.keys
    const params = Object.assign({}, this.params)
    for (let i = 1; i < matches.length; i++) {
      params[keys[i - 1]] = matches[i]
    }

    return params
  }
}
