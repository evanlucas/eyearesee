'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const debug = require('debug')('eyearesee:views:settings')
const path = require('path')
const HOME = process.env.EYEARESEE_HOME
const THEMES_DIR = path.join(HOME, 'themes')

// Components
const Checkbox = require('./components/setting-checkbox')
const ColorPicker = require('./components/setting-colorpicker')
const ThemeSelect = require('./components/setting-theme')

const SETTINGS = [
  { title: 'Settings', type: 'title' }
, { id: 'user.color'
  , title: 'Nickname Color'
  , note: 'Set the color of your nickname in all chats'
  , type: 'colorpicker'
  }
, { id: 'theme.active'
  , title: 'Theme'
  , note: `To add a new theme, place a .css file in ${THEMES_DIR}. `
  , type: 'themeselect'
  }
, { id: 'sounds.enabled'
  , title: 'Play Sounds'
  , note: 'Sounds will be played for things like receiving a new message.'
  , type: 'checkbox'
  }
, { id: 'invites.accept.auto'
  , title: 'Auto Accept Invites'
  , note: 'Auto join channel when invited.'
  , type: 'checkbox'
  }
, { id: 'userbar.hidden'
  , title: 'Hide Userbar'
  , note: 'The Userbar is normally shown when viewing a Channel.'
  , type: 'checkbox'
  }
, { id: 'inline.images'
  , title: 'Inline Images'
  , note: 'Urls that are images will render the image inline'
  , type: 'checkbox'
  }
]

module.exports = Settings

function Settings(target) {
  if (!(this instanceof Settings))
    return new Settings(target)

  Base.call(this, target)

  this.checkbox = new Checkbox(target)
  this.colorpicker = new ColorPicker(target)
  this.themeselect = new ThemeSelect(target)
}
inherits(Settings, Base)

Settings.prototype.close = function close(e) {
  e.preventDefault()
  this.target.router.goto('/connection')
}

Settings.prototype.onChangeTheme = function onChangeTheme(e) {
  debug('changed to %s', e.target.value)
  this.target.themes.activate(e.target.value)
}

Settings.prototype.reloadThemes = function reloadThemes(e) {
  const currentTheme = this.target.settings.get('theme.active')
  this.target.themes.load(currentTheme, () => {
    this.target.needsLayout()
  })

  e.target.blur()
}

Settings.prototype.render = function render() {
  const items = new Array(SETTINGS.length)

  for (const item of SETTINGS) {
    if (item.type === 'title') {
      items.push(h('h3.form-title', item.title))
    } else {
      items.push(this[item.type].render(item))
    }
  }

  return h('irc-settings.settings-container', [
    h('a.close', {
      innerHTML: '&times;'
    , onclick: (e) => {
        this.close(e)
      }
    })
  , h('.form.form-dark.col-sm-8', [
      h('.clearfix')
    , h('form.form', items)
    ])
  ])
}
