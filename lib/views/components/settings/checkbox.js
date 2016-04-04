'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = Checkbox

function Checkbox(target) {
  if (!(this instanceof Checkbox))
    return new Checkbox(target)

  Base.call(this, target)
}
inherits(Checkbox, Base)

Checkbox.prototype.render = function render(opts) {
  return h('.form-group', [
    h('.checkbox', [
      h('label', [
        h('input', {
          type: 'checkbox'
        , id: opts.id
        , checked: this.target.settings.get(opts.id)
        , onchange: (e) => {
            this.target.settings.set(opts.id, e.target.checked)
            this.target.needsLayout()
          }
        })
      , h('.setting-title', ` ${opts.title}`)
      , h('p.form-control-static', opts.note)
      ])
    ])
  ])
}
