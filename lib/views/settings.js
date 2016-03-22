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

Settings.prototype.onAutoAcceptInvite = function onAutoAcceptInvite(e) {
  debug('autoAcceptInvites changed')
  const checked = e.target.checked
  this.target.settings.set('autoAcceptInvites', checked, (err) => {
    if (err) {
      console.error('error setting autoAcceptInvites', err)
      this.target.showNote('error', 'Unable to update settings at this time.')
      return
    }

    this.target.needsLayout()
    this.target.showNote('success', 'Successfully updated invite settings')
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
  , h('.form.form-dark.col-sm-8', [
      h('.clearfix')
    , h('form.form', [
        h('h3.form-title', 'Settings')
      , h('.form-group', [
          h('label.control-label', {
            attributes: {
              for: 'theme'
            }
          }, 'Theme')
        , h('select.form-control', {
            onchange: (e) => {
              this.onChangeTheme(e)
            }
          }, themes)
        ])
      , h('.form-group', [
          h('p.form-control-static', note)
        ])
      , checkbox('playSounds', (e) => {
          this.onPlaySoundsChange(e)
        }, ' Play Sounds', settings)
      , checkbox('autoAcceptInvites', (e) => {
          this.onAutoAcceptInvite(e)
        }, ' Auto Accept Invites', settings)
      ])
    ])
  ])
}

function checkbox(id, onchange, title, settings) {
  return h('.form-group', [
    h('.checkbox', [
      h('label', [
        h('input', {
          type: 'checkbox'
        , id: id
        , checked: settings.get(id)
        , onchange: onchange
        })
      , h('.setting-title', title)
      ])
    ])
  ])
}
