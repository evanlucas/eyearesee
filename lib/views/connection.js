'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const Log = require('./connection-log')

module.exports = Connection

function Connection(target) {
  if (!(this instanceof Connection))
    return new Connection(target)

  Base.call(this, target)

  this.log = new Log(target)
}
inherits(Connection, Base)

Connection.prototype.onclick = function onclick(e, conn) {
  e.preventDefault()
  this.target.router.goto(`${conn.url}/settings`)
}

Connection.prototype.render = function render(conn) {
  return [
    h('irc-header.pure-g', [
      h('.pure-u-1-1', [
        h('a.settings', {
          onclick: (e) => {
            this.onclick(e, conn)
            return false
          }
        }, [
          h('i.fa.fa-cog')
        ])
      , h('h2.title', conn.name)
      , h('p.subtitle', `${conn.server.host}:${conn.server.port}`)
      ])
    ])
  , h('.logs-container', {
      onscroll: (e) => {
        this.target.emit('scroll', e)
      }
    }, [
      h('ul.logs', conn.logs.map((log) => {
        return this.log.render(log)
      }))
    ])
  ]
}
