'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const mapUtil = require('map-util')

module.exports = CommandBar

function CommandBar(target, input) {
  if (!(this instanceof CommandBar))
    return new CommandBar(target, input)

  Base.call(this, target)

  this.input = input
  this.manager = target.commandManager
}
inherits(CommandBar, Base)

CommandBar.prototype.next = function next() {
  this.manager.next()
  this.target.needsLayout()
}

CommandBar.prototype.prev = function prev() {
  this.manager.prev()
  this.target.needsLayout()
}

CommandBar.prototype.select = function select() {
  const active = this.manager._active
  if (!active) return
  this.input._showingCommandBar = false
  return `${active.cmd} ` // add a space to make life easier
}

CommandBar.prototype.render = function render(opts) {
  opts = opts || {}

  const cmds = this.manager.commands
  const items = new Array(cmds.size)
  let i = 0
  for (const item of cmds.values()) {
    items[i++] = h(`li.command${item.active ? '.active' : ''}`, [
      h('strong', item.cmd)
    , h('span.args', item.args)
    , h('span.description', item.description)
    ])
  }

  return h('#commandbar.panel.panel-default', {
    hidden: opts.hidden !== false
  }, [
    h('.panel-heading', 'Commands')
  , h('.panel-body', [
      h('ul.commands', items)
    ])
  ])
}
