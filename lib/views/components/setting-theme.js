'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = ThemeSelect

function ThemeSelect(target) {
  if (!(this instanceof ThemeSelect))
    return new ThemeSelect(target)

  Base.call(this, target)
}
inherits(ThemeSelect, Base)

ThemeSelect.prototype.render = function render(opts) {
  const id = opts.id

  const settings = this.target.settings
  const themes = this.target.themes.themes
  const items = new Array(themes.size)
  let i = 0
  for (const item of themes.values()) {
    items[i++] = h('option', {
      selected: item.active
    }, item.name)
  }

  return h('.form-group', [
    h('label.control-label', {
      attributes: {
        for: id
      }
    }, opts.title)
  , h('select.form-control', {
      onchange: (e) => {
        this.target.themes.activate(e.target.value)
      }
    }, items)
  , h('p.form-control-static', [
      opts.note
    , h('button.btn.btn-link', {
        onclick: (e) => {
          e.target.blur()
          const currentTheme = settings.get('theme.active')
          this.target.themes.load(currentTheme, () => {
            this.target.needsLayout()
          })
          return false
        }
      , tabindex: '-1'
      , attributes: {
          tabindex: '-1'
        }
      }, 'Reload')
    ])
  ])
}
