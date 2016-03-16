'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const mapUtil = require('map-util')
const completor = require('completor')
const debug = require('debug')('eyearesee:views:command-bar')

module.exports = CommandBar

function CommandBar(target, input) {
  if (!(this instanceof CommandBar))
    return new CommandBar(target, input)

  Base.call(this, target)

  this.input = input
  this.manager = target.commandManager
  this._filter = ''
  this._showing = false
}
inherits(CommandBar, Base)

CommandBar.prototype.isShowing = function isShowing() {
  return this._showing
}

CommandBar.prototype.show = function show() {
  this._showing = true
  return this
}

CommandBar.prototype.hide = function hide() {
  this._showing = false
  this.updateFilter('')
  return this
}

const inputRE = /\/([a-zA-Z]+)?$/
CommandBar.prototype.updateFilter = function updateFilter(filter) {
  debug('update filter %s', filter)
  this._filter = filter
  if (!this._filter) {
    this._showing = false
  } else if (inputRE.test(this._filter)) {
    this.show()
  }
  return this
}

CommandBar.prototype.next = function next() {
  const item = this.manager.next()
  debug('next %s', item.cmd)
  if (item) {
    return `${item.cmd} `
  }
  return null
}

CommandBar.prototype.prev = function prev() {
  const item = this.manager.prev()
  debug('prev %s', item.cmd)
  if (item) {
    return `${item.cmd} `
  }
  return null
}

CommandBar.prototype.select = function select() {
  const active = this.manager._active
  if (!active) return
  this.hide()
  return `${active.cmd} ` // add a space to make life easier
}

CommandBar.prototype._getEles = function _getEles() {
  const cmds = this.manager.commands
  let items

  const hidden = !this.isShowing()

  if (this._filter) {
    let i = 0
    const names = this.manager._names
    const matches = completor(this._filter, names)
    if (!matches.length) {
      // hide the command bar, no matches
      this.hide()
    }

    items = new Array(matches.length)
    let foundActive = false
    const active = this.manager._active
    if (active) {
      const activeName = active.cmd
      if (~matches.indexOf(activeName)) {
        foundActive = true
      }
    }

    for (let j = 0; j < matches.length; j++) {
      const item = this.manager.commands.get(matches[j])
      if (!foundActive && j === 0) {
        this.manager._setActive(item)
      }
      items[j] = h(`li.command${item.active ? '.active' : ''}`, [
        h('strong', item.cmd)
      , h('span.args', item.args)
      , h('span.description', item.description)
      ])
    }
  } else {
    const len = cmds.size
    items = new Array(len)
    let i = 0
    for (const item of cmds.values()) {
      items[i++] = h(`li.command${item.active ? '.active' : ''}`, [
        h('strong', item.cmd)
      , h('span.args', item.args)
      , h('span.description', item.description)
      ])
    }
  }

  return items
}

CommandBar.prototype.render = function render(opts) {
  opts = opts || {}

  const items = this._getEles()
  const hidden = !this.isShowing()
  return h('#commandbar.panel.panel-default', {
    hidden: hidden
  }, [
    h('.panel-heading', 'Commands')
  , h('.panel-body', [
      h('ul.commands', items)
    ])
  ])
}
