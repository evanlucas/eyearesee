'use strict'

const electron = require('electron')
const remote = require('remote')
const ipc = electron.ipcRenderer
const EE = require('events')
const inherits = require('util').inherits
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')
const Styles = require('./styles/manager')
const path = require('path')
const fs = require('fs')

module.exports = window.ListWindow = ListWindow

const RESOURCES = process.env.EYEARESEE_RESOURCE_PATH

function ListWindow() {
  if (!(this instanceof ListWindow))
    return new ListWindow()

  EE.call(this)
  this.el = document.body
  this.window = remote.getCurrentWindow()

  this.styles = new Styles()
  this._addStyles()
  this.data = []

  var tree = this.render()
  var rootNode = createElement(tree)
  this.el.appendChild(rootNode)

  this.on('render', () => {
    const newTree = this.render()
    const patches = diff(tree, newTree)
    rootNode = patch(rootNode, patches)
    tree = newTree
  })

  this.window.on('close', () => {
    ipc.removeAllListeners('list')
    ipc.removeAllListeners('list:end')
    this.window = null
  })

  ipc.on('list', (ev, msgs) => {
    for (let i = 0; i < msgs.length; i++) {
      this.data.push(msgs[i])
    }

    this.data.sort((a, b) => {
      if (a.count === b.count) {
        return a.name < b.name
          ? -1
          : a.name > b.name
          ? 1
          : 0
      }

      return a.count < b.count
        ? 1
        : a.count > b.count
        ? -1
        : 0
    })
    this.emit('render')
  })

  ipc.once('list:end', () => {
    console.log('list end')
  })
}
inherits(ListWindow, EE)

ListWindow.prototype.render = function render() {
  return h('#list.container', [
    h('table.table.channels', [
      h('thead', [
        h('tr', [
          h('th', 'Channel')
        , h('th', 'Users')
        , h('th', 'Description')
        ])
      ])
    , h('tbody', this.data.map((item) => {
        return h('tr', [
          h('td', item.name)
        , h('td', item.count ? item.count.toString() : 0)
        , h('td', {
            innerHTML: item.desc
          })
        ])
      }))
    ])
  ])
}

ListWindow.prototype._addStyles = function _addStyles() {
  const ele = this.styles.buildElement()
  document.head.appendChild(ele)

  const fp = path.join(RESOURCES, 'public', 'css', 'dusk.css')
  const contents = fs.readFileSync(fp, 'utf8')
  this.styles.addStyleSheet(contents, {
    sourcePath: fp
  })
}
