'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = ShowHideButton

function ShowHideButton(target) {
  Base.call(this, target)
}
inherits(ShowHideButton, Base)

ShowHideButton.prototype.onClick = function onClick(e, hide) {
  e.preventDefault()
  const settings = this.target.settings
  settings.set('hideUserbar', hide, (err) => {
    if (err) {
      console.error('could not save settings', err)
      return
    }
    // actually show or hide it
    this.target.needsLayout()
  })
}

const showClass = 'fa-chevron-left'
const hideClass = 'fa-chevron-right'

ShowHideButton.prototype.render = function render(hide) {
  const cl = hide ? showClass : hideClass
  return h('button#showHideButton.btn.btn-primary', {
    onclick: (e) => {
      this.onClick(e, !hide)
    }
  }, [
    h(`i.fa.${cl}`)
  ])
}
