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
  settings.set('userbar.hidden', hide)
  this.target.needsLayout()
}

const showClass = 'fa-chevron-left'
const hideClass = 'fa-chevron-right'

ShowHideButton.prototype.render = function render(hide) {
  const cl = hide ? showClass : hideClass
  return h('button#showHideButton.btn.btn-primary', {
    onclick: (e) => {
      this.onClick(e, !hide)
      return false
    }
  , tabindex: '-1'
  , attributes: {
      tabindex: '-1'
    }
  }, [
    h(`i.fa.${cl}`)
  ])
}
