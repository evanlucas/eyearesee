'use strict'

const IRC = require('eyearesee-client')
const mapUtil = require('map-util')

const Connection = IRC.Connection
const Channel = IRC.Channel
const Settings = IRC.Settings
const prevVal = mapUtil.prevVal
const nextVal = mapUtil.nextVal
const firstVal = mapUtil.firstVal
const lastVal = mapUtil.lastVal

module.exports = class Panels {
  constructor(app) {
    this.app = app
  }

  render(model) {
    if (model && model.url)
      this.app.router.goto(model.url)
  }

  previousPanel() {
    const p = this.app.activeModel

    if (!p) return

    if (p instanceof Connection) {
      if (this.app.connections.size > 1) {
        const prev = prevVal(p, this.app.connections)
        if (prev) {
          if (prev._panels.size) {
            const last = lastVal(prev._panels)
            if (last) {
              return this.render(last)
            }
          }

          // no panels, show the previous connection
          return this.render(prev)
        }
      }

      if (p._panels.size) {
        return this.render(lastVal(p._panels))
      }
    } else if (p instanceof Channel) {
      const conn = p.getConnection()
      const n = prevVal(p, conn._panels)
      if (n) {
        return this.render(n)
      }

      this.render(conn)
    }
  }

  nextPanel() {
    const p = this.app.activeModel

    if (!p) return

    if (p instanceof Connection) {
      if (p._panels.size) {
        return this.render(firstVal(p._panels))
      }

      if (this.app.connections.size > 1) {
        const n = nextVal(p, this.app.connections, true)
        if (n) return this.render(n)
      }
    } else if (p instanceof Channel) {
      const conn = p.getConnection()

      const n = nextVal(p, conn._panels)
      if (n) return this.render(n)

      if (this.app.connections.size > 1) {
        const n = nextVal(conn, this.app.connections, true)
        if (n) return this.render(n)
      } else {
        this.render(conn)
      }
    }
  }

  showUserbar() {
    if (this.app.settings.get('userbar.hidden')) {
      this.app.settings.set('userbar.hidden', false)
      this.app.needsLayout()
    }
  }

  hideUserbar() {
    if (!this.app.settings.get('userbar.hidden')) {
      this.app.settings.set('userbar.hidden', true)
      this.app.needsLayout()
    }
  }
}
