'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = ColorPicker

function ColorPicker(target) {
  if (!(this instanceof ColorPicker))
    return new ColorPicker(target)

  Base.call(this, target)
}
inherits(ColorPicker, Base)

ColorPicker.prototype.render = function render(opts) {
  const id = opts.id
  const val = this.target.settings.get(id)

  return h('.form-group', [
    h('label.control-label', {
      for: id
    }, opts.title)
  , h('.input-group', [
      h('span.input-group-addon', {
        style: {
          backgroundColor: val
        }
      })
    , h('input.form-control', {
        type: 'text'
      , id: id
      , onkeyup: (e) => {
          this.target.settings.set(id, e.target.value)
          this.target.needsLayout()
        }
      , value: val
      })
    ])
  , h('p.form-control-static', opts.note)
  ])
}
