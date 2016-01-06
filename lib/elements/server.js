'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const utils = require('../utils')
const linker = require('../linker')

module.exports = Server

function Server(target) {
  Base.call(this, target)
}
inherits(Server, Base)

Server.prototype.render = function render() {
  const data = this.target.data
  const s = data.server
  const info = `${s.host}:${s.port}`

  const logs = utils.flatten(data.logs)

  const l = logs.map((log) => {
    var msgs = log.messages
    var className = '.callout'
    var title = 'Message'
    switch (log.type) {
      case 'motd':
        className += '.callout-purple'
        title = 'Message of the Day'
        break
      case 'notice':
        className += '.callout-yellow'
        title = 'Notice'
        break
      case 'welcome':
        className += '.callout-green'
        title = 'Welcome'
        break
      case 'topic':
        className += '.callout-blue'
        title = `Topic ${log.channel}`
        break
    }

    const kids = [
      h('h4', title)
    ]

    for (var i = 0; i < msgs.length; i++) {
      // TODO(evanlucas) only use innerHTML when we know the source
      kids.push(h('p', {
        innerHTML: linker(msgs[i])
      }))
    }

    return h('li', [
      h(className, kids)
    ])
  })

  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', 'Logs')
      , h('p.subtitle', info)
      ])
    ])
  , h('.logs-container', [
      h('ul.logs', l)
    ])
  ]
}
