'use strict'

const StylesElement = require('./element')
const EE = require('events')
const debug = require('debug')('eyearesee:styles:manager')

module.exports = Manager

function Manager() {
  this.emitter = new EE()
  this.elements = []
  this.elementsByPath = new Map()
}

Manager.prototype.observeElements = function observeElements(cb) {
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

Manager.prototype.removeStyleSheet = function removeStyleSheet(fp) {
  const ele = this.elementsByPath.get(fp)
  if (!ele) {
    debug('cannot find ele to remove %s', fp)
    return false
  }

  debug('remove ele %s', fp)
  this.removeElement(ele)
}

Manager.prototype.getStyleElements = function getStyleElements() {
  return this.elements.slice()
}

Manager.prototype.buildElement = function buildElement() {
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

  debug('addStyleSheet %s', sourcePath)
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
    debug('update existing ele')
    this.emitter.emit('did-update-style-element', ele)
  } else {
    debug('add new ele')
    this.addElement(ele)
  }
}

Manager.prototype.addElement = function addElement(ele) {
  const sourcePath = ele.sourcePath

  this.elements.push(ele)
  this.elementsByPath.set(sourcePath, ele)
  this.emitter.emit('did-add-style-element', ele)
}

Manager.prototype.removeElement = function removeElement(ele) {
  debug('remove ele')
  const idx = this.elements.indexOf(ele)
  if (idx === -1) {
    debug('could not find ele')
    return
  }
  this.elements.splice(idx, 1)
  this.elementsByPath.delete(ele.sourcePath)
  this.emitter.emit('did-remove-style-element', ele)
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
