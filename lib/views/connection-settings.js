'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const debug = require('debug')('eyearesee:views:connection-settings')

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
    h('#header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title', `Server Settings`)
      , h('.p.subtitle', conn.name)
      ])
    ])
  , h('#settings.settings-container', [
      h('.form.form-dark', [
        h('a.close', {
          innerHTML: '&times;'
        , onclick: (e) => {
            this.onclose(e, conn)
          }
        })
      , h('form', [
          h('h3', 'Connection Settings')
        , group('connname', 'text', 'Name', 'Name', true, conn.name)
        , group('host', 'text', 'Host', 'Host', true, conn.host)
        , group('port', 'number', 'Port', 'Port', true, conn.port)
        , checkbox({
            id: 'autoConnect'
          , text: 'Auto Connect'
          , checked: conn.autoConnect
          })
        , checkbox({
            id: 'showEvents'
          , text: 'Show General Events'
          , checked: conn.showEvents
          })
        , checkbox({
            id: 'logTranscripts'
          , text: 'Log transcripts'
          , checked: conn.logTranscripts
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
          , value: conn.logLocation || ''
          })
        , h('input#loginButton', {
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
  ]
}

function disabledGroup(opts) {
  return h('.group', [
    h('span.label', {
      attributes: {
        for: opts.id
      }
    }, opts.text)
  , h('input.input', {
      id: opts.id
    , type: opts.type
    , placeholder: opts.placeholder
    , required: opts.required
    , value: opts.value
    , disabled: true
    })
  ])
}

function group(id, type, text, ph, required, value) {
  return h('.group', [
    h('span.label', {
      attributes: {
        for: id
      }
    }, text)
  , h('input.input', {
      id: id
    , type: type
    , placeholder: ph
    , required: required
    , value: value
    })
  ])
}

function checkbox(opts) {
  const id = opts.id
  const text = opts.text
  const checked = opts.checked
  const onchange = opts.onchange
  return h('.checkbox', [
    h('label', {
      attributes: {
        for: id
      }
    }, [
      h('input', {
        type: 'checkbox'
      , id: id
      , checked: checked
      , onchange: onchange
      })
    , ` ${text}`
    ])
  ])
}

function $(str) {
  return document.getElementById(str)
}
