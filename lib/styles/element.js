'use strict'

const EE = require('events')

class StylesElement extends HTMLElement {
  constructor() {
    super()
    this.emitter = null
    this.context = null
    this.clones = null
    this.manager = null
  }

  onDidAddElement(cb) {
    this.emitter.on('did-add-style-element', cb)
  }

  onDidRemoveElement(cb) {
    this.emitter.on('did-remove-style-element', cb)
  }

  onDidUpdateElement(cb) {
    this.emitter.on('did-update-style-element', cb)
  }

  attachedCallback() {
    this.context = this.getAttribute('context') || undefined
  }

  createdCallback() {
    this.emitter = new EE()
    this.clones = new WeakMap()
  }

  detachedCallback() {

  }

  attributeChangedCallback(name, prev, curr) {

  }

  initialize(manager) {
    this.manager = manager
    manager.observeElements((ele) => {
      this.elementAdded(ele)
    })

    manager.onDidRemoveElement((ele) => {
      this.elementRemoved(ele)
    })

    manager.onDidUpdateElement((ele) => {
      this.elementUpdated(ele)
    })
  }

  elementAdded(ele) {
    const clone = ele.cloneNode(true)
    clone.sourcePath = ele.sourcePath
    clone.context = ele.context

    this.clones.set(ele, clone)

    this.insertBefore(clone, null)

    this.emitter.emit('did-add-style-element', clone)
  }

  elementRemoved(ele) {
    const clone = this.clones.get(ele) || ele
    ele.remove()
    this.emitter.emit('did-remove-style-element', clone)
  }

  elementUpdated(ele) {
    const clone = this.clones.get(ele)
    clone.textContent = ele.textContent
    this.emitter.emit('did-update-style-element', clone)
  }
}

module.exports = StylesElement = document.registerElement('eyearesee-styles', {
  prototype: StylesElement.prototype
})
