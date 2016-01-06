'use strict'

const debug = require('debug')('eyearesee:nav')

module.exports = Nav

function Nav(app) {
  if (!(this instanceof Nav))
    return new Nav(app)

  this.app = app
  this.current = ''
  this._currentNode = null
}

Nav.prototype.setup = function setup() {
  this.app.on('nav', (node) => {
    if (!node) return
    const href = `#${node.href.split('#')[1]}`
    if (this.current === href)
      return

    this.show(href, node)
  })
}

Nav.prototype.show = function show(name, node) {
  if (this._currentNode)
    this._currentNode.classList.remove('active')

  this.current = name
  this._currentNode = node
  this._currentNode.classList.add('active')
  debug('show %s', name)
  this.app.emit('render')
}
