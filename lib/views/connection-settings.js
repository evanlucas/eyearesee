'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const debug = require('debug')('eyearesee:views:connection-settings')
const ConnSettings = require('../models/connection-settings')

const DEF = ConnSettings.DEFAULT_PART_MESSAGE

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

Settings.prototype.onsave = function onsave(e, settings) {
  e.preventDefault()
  const opts = {
    name: $('connname').value
  , host: $('host').value
  , port: $('port').value
  , autoConnect: $('autoConnect').checked
  , showEvents: $('showEvents').checked
  , logTranscripts: $('logTranscripts').checked
  , logLocation: $('logLocation').value
  , partMsg: $('partMsg').value
  }

  debug('opts', opts)

  settings.update(opts, function(err) {
    if (err) {
      debug('update error', err)
      // show some sort of error message
    } else {
      debug('update success')
      // show success notification
    }
  })
}

Settings.prototype.logOnChange = function logOnChange(e, conn) {
  const checked = $('logTranscripts').checked
  if (checked) {
    // show dialog
    const remote = require('electron').remote
    const dialog = remote.dialog
    dialog.showOpenDialog({
      properties: [
        'openDirectory'
      , 'createDirectory'
      ]
    , title: 'Log Location File Path'
    }, (filenames) => {
      if (Array.isArray(filenames)) {
        const dir = filenames[0]
        $('logLocation').value = dir
      }
    })
  }
}

Settings.prototype.render = function render(settings) {
  const conn = settings.conn
  return [
    h('irc-header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', `Server Settings`)
      , h('.p.subtitle', conn.name)
      ])
    ])
  , h('#settings.settings-container', [
      h('.form.form-dark.col-sm-12', [
        h('form.form-horizontal', [
          group('connname', 'text', 'Name', 'Name', true, conn.name)
        , group('host', 'text', 'Host', 'Host', true, conn.host)
        , group('port', 'number', 'Port', 'Port', true, conn.port)
        , checkbox({
            id: 'autoConnect'
          , text: 'Auto Connect'
          , checked: settings.get('autoConnect')
          })
        , checkbox({
            id: 'showEvents'
          , text: 'Show General Events'
          , checked: settings.get('showEvents')
          })
        , checkbox({
            id: 'logTranscripts'
          , text: 'Log transcripts'
          , checked: settings.get('logTranscripts')
          , onchange: (e) => {
              this.logOnChange(e, conn)
            }
          })
        , disabledGroup({
            id: 'logLocation'
          , text: 'Log Location'
          , type: 'text'
          , placeholder: 'Log Location'
          , required: false
          , value: settings.get('logLocation') || ''
          })
        , group('partMsg', 'text', 'Part Message', DEF, false, DEF)
        , h('.col-sm-2')
        , h('.col-sm-8', [
            h('.col-sm-6', [
              h('button#cancelBtn.btn.btn-danger.btn-lg.btn-block', {
                onclick: (e) => {
                  this.onclose(e, conn)
                  return false
                }
              }, 'Close')
            ])
          , h('.col-sm-6', [
              h('input#loginButton.btn.btn-lg.btn-block.btn-primary', {
                  type: 'submit'
                , value: 'Save Settings'
                , onclick: (e) => {
                    this.onsave(e, settings)
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

function disabledGroup(opts) {
  return h('.form-group', [
    h('label.control-label.col-sm-2', {
      attributes: {
        for: opts.id
      }
    }, opts.text)
  , h('.col-sm-8', [
      h('input.form-control', {
        id: opts.id
      , type: opts.type
      , placeholder: opts.placeholder
      , required: opts.required
      , value: opts.value
      , disabled: true
      })
    ])
  ])
}

function group(id, type, text, ph, required, value) {
  return h('.form-group', [
    h('label.control-label.col-sm-2', {
      attributes: {
        for: id
      }
    }, text)
  , h('.col-sm-8', [
      h('input.form-control', {
        id: id
      , type: type
      , placeholder: ph
      , required: required
      , value: value
      })
    ])
  ])
}

function checkbox(opts) {
  const id = opts.id
  const text = opts.text
  const checked = opts.checked
  const onchange = opts.onchange
  return h('.form-group', [
    h('.col-sm-offset-2.col-sm-8', [
      h('.checkbox', [
        h('label', [
          h('input', {
            type: 'checkbox'
          , id: id
          , checked: checked
          , onchange: onchange
          })
        , ` ${text}`
        ])
      ])
    ])
  ])
}

function $(str) {
  return document.getElementById(str)
}
