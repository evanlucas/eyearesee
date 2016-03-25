'use strict'

const EE = require('events')
const debug = require('debug')('eyearesee:router')
const Route = require('./route')

module.exports = class Router extends EE {
  constructor(app) {
    super()
    this.routes = new Map()
    this.url = app.url || '/login'
    this.app = app
  }

  add(path, fn) {
    const route = new Route(path, fn)
    this.routes.set(path, route)
  }

  remove(path) {
    this.routes.delete(path)
  }

  goto(path) {
    for (const route of this.routes.values()) {
      const params = route.match(path)
      if (params) {
        debug('dispatch route %s %j', path, params)

        this.url = path
        this.app.url = path
        route.fn(params)
        return
      }
    }

    debug('could not dispatch %s', path)
  }
}
