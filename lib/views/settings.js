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
  this.target.router.goto('/connection')
}

Settings.prototype.onPlaySoundsChange = function onPlaySoundsChange(e) {
  debug('playSounds changed')
  const checked = e.target.checked
  this.target.settings.set('sounds.enabled', checked)
  this.target.needsLayout()
}

Settings.prototype.onAutoAcceptInvite = function onAutoAcceptInvite(e) {
  debug('autoAcceptInvites changed')
  const checked = e.target.checked
  this.target.settings.set('invites.accept.auto', checked)
  this.target.needsLayout()
}

Settings.prototype.onChangeTheme = function onChangeTheme(e) {
  debug('changed to %s', e.target.value)
  this.target.themes.activate(e.target.value)
}

const notes = {
  'playSounds': 'Sounds will be played for things like receiving' +
    ' a new message.'
, 'autoAcceptInvites': 'Auto join channel when invited.'
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
        , h('p.form-control-static', note)
        ])
      , checkbox('playSounds', (e) => {
          this.onPlaySoundsChange(e)
        }, ' Play Sounds', settings, notes.playSounds)
      , checkbox('autoAcceptInvites', (e) => {
          this.onAutoAcceptInvite(e)
        }, ' Auto Accept Invites', settings, notes.autoAcceptInvites)
      ])
    ])
  ])
}

function checkbox(id, onchange, title, settings, note) {
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
      , h('p.form-control-static', note)
      ])
    ])
  ])
}
