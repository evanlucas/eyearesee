'use strict'
'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = CommandBar

function CommandBar(target) {
  if (!(this instanceof CommandBar))
    return new CommandBar(target)

  Base.call(this, target)
}
inherits(CommandBar, Base)

CommandBar.prototype.render = function render(opts) {
  opts = opts || {}
  return h('#commandbar.panel.panel-default', {
    hidden: opts.hidden !== false
  }, [
    h('.panel-heading', 'Commands')
  , h('.panel-body', [
      h('ul.commands', [])
    ])
  ])
}
