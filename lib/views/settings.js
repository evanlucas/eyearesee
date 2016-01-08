'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const debug = require('debug')('eyearesee:views:settings')

module.exports = Settings

function Settings(target) {
  if (!(this instanceof Settings))
    return new Settings(target)

  Base.call(this, target)
}
inherits(Settings, Base)

Settings.prototype.onclose = function onclose(e, conn) {
  debug('onclose')
  e.preventDefault()
  this.target.nav.showConnection(conn)
}

Settings.prototype.onsave = function onsave(e) {
  debug('onsave')
  e.preventDefault()
}

Settings.prototype.render = function render(settings) {
  const conn = settings.conn
  return [
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('a.close', {
          onclick: (e) => {
            this.onclose(e, conn)
            return false
          }
        , innerHTML: '&times;'
        })
      , h('h2.title', `Server Settings`)
      , h('.p.subtitle', conn.name)
      ])
    ])
  , h('.settings-container', [
      h('.settings-form.pure-u-1-2', [
        h('h3', 'Connection Settings')
      , h('form.pure-form.pure-form-aligned', [
          h('fieldset', [
            group('connname', 'text', 'Name', 'Name', conn.name)
          , group('host', 'text', 'Host', 'Host', conn.host)
          , group('port', 'number', 'Port', 'Port', conn.port)
          , h('.pure-controls', [
              checkbox('autoconnect', 'Auto Connect', conn.autoConnect)
            , checkbox('showevents', 'Show General Events', conn.showEvents)
            , h('button#saveConnSettings.pure-button.pure-button-primary', {
                type: 'submit'
              , onclick: (e) => {
                  this.onsave(e)
                  return false
                }
              }, 'Save Settings')
            ])
          ])
        ])
      ])
    ])
  ]
}

function group(id, type, text, ph, val) {
  return h('.pure-control-group', [
    h('label', {
      attributes: {
        for: id
      }
    }, text)
  , h('input', {
      id: id
    , type: type
    , placeholder: ph
    , value: val
    })
  ])
}

function checkbox(id, text, checked) {
  return h('label.pure-checkbox', {
    attributes: {
      for: id
    }
  }, [
    h('input', {
      type: 'checkbox'
    , id: id
    , checked: checked
    })
  , ` ${text}`
  ])
}
