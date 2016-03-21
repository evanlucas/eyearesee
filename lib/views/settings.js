'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const debug = require('debug')('eyearesee:views:settings')
const path = require('path')
const HOME = process.env.EYEARESEE_HOME
const THEMES_DIR = path.join(HOME, 'themes')

module.exports = Settings

function Settings(target) {
  if (!(this instanceof Settings))
    return new Settings(target)

  Base.call(this, target)
}
inherits(Settings, Base)

Settings.prototype.close = function close(e) {
  e.preventDefault()
  this.target.showConnection()
}

Settings.prototype.onPlaySoundsChange = function onPlaySoundsChange(e) {
  debug('playSounds changed')
  const checked = e.target.checked
  this.target.settings.set('playSounds', checked, (err) => {
    if (err) {
      console.error('error setting playSounds', err)
      this.target.showNote('error', 'Unable to update settings at this time.')
      return
    }

    this.target.needsLayout()
    this.target.showNote('success', 'Successfully updated sound settings')
  })
}

Settings.prototype.onChangeTheme = function onChangeTheme(e) {
  debug('changed to %s', e.target.value)
  this.target.themes.activate(e.target.value)
  this.target.showNote('success', 'Successfully activated theme')
}

Settings.prototype.render = function render() {
  const settings = this.target.settings
  const themes = new Array(this.target.themes.themes.size)
  let i = 0
  for (const item of this.target.themes.themes.values()) {
    themes[i++] = h('option', {
      selected: item.active
    }, item.name)
  }

  const note = `To add a new theme, place a .css file in ${THEMES_DIR}`

  return h('irc-settings.settings-container', [
    h('a.close', {
      innerHTML: '&times;'
    , onclick: (e) => {
        this.close(e)
      }
    })
  , h('.form.form-dark.col-sm-12', [
      h('.clearfix')
    , h('form.form-horizontal', [
        h('.form-group', [
          h('label.control-label.col-sm-3', {
            attributes: {
              for: 'theme'
            }
          }, 'Theme')
        , h('.col-sm-5', [
            h('select.form-control', {
              onchange: (e) => {
                this.onChangeTheme(e)
              }
            }, themes)
          ])
        , h('.col-sm-4')
        ])
      , h('.form-group', [
          h('.col-sm-3')
        , h('.col-sm-8', [
            h('p.form-control-static', note)
          ])
        , h('.col-sm-1')
        ])
      , h('.form-group', [
          h('.col-sm-offset-3.col-sm-9', [
            h('.checkbox', [
              h('label', [
                h('input', {
                  type: 'checkbox'
                , id: 'playSounds'
                , checked: settings.get('playSounds')
                , onchange: (e) => {
                    this.onPlaySoundsChange(e)
                  }
                })
              , ` Play Sounds`
              ])
            ])
          ])
        ])
      ])
    ])
  ])
}
