'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const Channels = require('./channels')
const Messages = require('./messages')

module.exports = Sidebar

function Sidebar(target) {
  Base.call(this, target)
}
inherits(Sidebar, Base)

Sidebar.prototype.render = function render() {
  const c = new Channels(this.target)
  const m = new Messages(this.target)

  const serverA = this.target.nav.current === 'server'
    ? 'a.pure-menu-link.active'
    : 'a.pure-menu-link'

  return [
    h('.nav-inner', [
      h('#logo', [
        h('i.fa.fa-eye')
      , h('span.logoname', 'EyeAreSee')
      ])
    , h('.pure-menu', [
        h('ul.pure-menu-list', [
          h('li.pure-menu-separator')
        , h('li.pure-menu-item', [
            h(serverA, {
              href: '#server'
            , id: 'server'
            }, 'Server')
          ])
        , h('li.pure-menu-separator')
        , c.render()
        , h('li.pure-menu-separator')
        , m.render()
        ])
      ])
    ])
  ]
}
