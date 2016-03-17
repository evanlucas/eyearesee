'use strict'

const StylesElement = require('./element')
const EE = require('events')

module.exports = Manager

function Manager() {
  this.emitter = new EE()
  this.elements = []
  this.elementsByPath = new Map()
}

Manager.prototype.observeElements = function observeElements(cb) {
  console.log('observe elements')
  const eles = this.getStyleElements()
  for (let i = 0; i < eles; i++) {
    const ele = eles[i]
    cb(ele)
  }

  this.onDidAddElement(cb)
}

Manager.prototype.onDidAddElement = function onDidAddElement(cb) {
  this.emitter.on('did-add-style-element', cb)
}

Manager.prototype.onDidRemoveElement = function onDidRemoveElement(cb) {
  this.emitter.on('did-remove-style-element', cb)
}

Manager.prototype.onDidUpdateElement = function onDidUpdateElement(cb) {
  this.emitter.on('did-update-style-element', cb)
}

Manager.prototype.getStyleElements = function getStyleElements() {
  return this.elements.slice()
}

Manager.prototype.buildElement = function buildElement() {
  console.log('building element', this.elements)
  const ele = new StylesElement()
  ele.initialize(this)
  return ele
}

Manager.prototype.addStyleSheet = function addStyleSheet(source, params) {
  params = params || {}
  const sourcePath = params.sourcePath
  const context = params.context
  let ele
  let updated = false
  if (sourcePath && this.elementsByPath.has(sourcePath)) {
    ele = this.elementsByPath.get(sourcePath)
    updated = true
  } else {
    ele = document.createElement('style')
    if (sourcePath) {
      ele.sourcePath = sourcePath
      ele.setAttribute('source-path', sourcePath)
    }

    if (context) {
      ele.context = context
      ele.setAttribute('context', context)
    }
  }

  ele.textContent = source

  if (updated) {
    this.emitter.emit('did-update-style-element', ele)
  } else {
    this.addElement(ele)
  }
}

Manager.prototype.addElement = function addElement(ele) {
  console.log('addElement', ele)
  const sourcePath = ele.sourcePath
  const context = ele.context

  this.elements.push(ele)
  this.elementsByPath.set(sourcePath, ele)
  this.emitter.emit('did-add-style-element', ele)
}

Manager.prototype.removeElement = function removeElement(ele) {
  const idx = this.elements.indexOf(ele)
  if (index === -1) return
  this.elements.splice(idx, 1)
  this.elementsByPath.delete(ele.sourcePath)
  this.emit('did-remove-style-element', ele)
}

Manager.prototype.getSnapshot = function getSnapshot() {
  return this.elements.slice()
}

Manager.prototype.restoreSnapshot = function restoreSnapshot(elesToRestore) {
  const eles = this.getStyleElements()
  for (let i = 0; i < eles.length; i++) {
    const ele = eles[i]
    if (elesToRestore.indexOf(ele) === -1) {
      this.removeElement(ele)
    }
  }

  const existing = this.getStyleElements()
  for (let i = 0; i < elesToRestore.length; i++) {
    const ele = elesToRestore[i]
    if (existing.indexOf(ele) !== -1) {
      this.addElement(ele)
    }
  }
}
