'use strict'

const h = require('virtual-dom/h')
const Base = require('vdelement')
const inherits = require('util').inherits
const debug = require('debug')('eyearesee:views:connection-settings')

const Checkbox = require('./components/connection/checkbox')

module.exports = Settings

function Settings(target) {
  if (!(this instanceof Settings))
    return new Settings(target)

  Base.call(this, target)

  this.checkbox = new Checkbox(target)
}
inherits(Settings, Base)

Settings.prototype.onclose = function onclose(e, conn) {
  debug('onclose')
  e.preventDefault()
  this.target.router.goto(conn.url)
}

Settings.prototype.onsave = function onsave(e, settings) {
  e.preventDefault()
  const opts = {
    'connect.auto': $('connect.auto').checked
  , 'log.events': $('log.events').checked
  , 'transcripts.enabled': $('transcripts.enabled').checked
  , 'transcripts.location': $('transcripts.location').value
  , 'part.message': $('part.message').value
  , 'persist.password': $('persist.password').checked
  , 'messages.limit': $('messages.limit').value
  }

  debug('opts', opts)

  settings.load(opts)
  this.target.persistConn(settings.getConnection(), (err) => {
    if (err) {
      console.error('cannot persist settings', err)
    } else {
      debug('connection persisted')
    }
  })
}

Settings.prototype.logOnChange = function logOnChange(e, conn) {
  const checked = $('transcripts.enabled').checked
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
        $('transcripts.location').value = dir
      }
    })
  }
}

Settings.prototype.render = function render(settings) {
  const conn = settings.getConnection()
  const DEF = settings.get('part.message')
  return [
    h('irc-header.pure-g', [
      h('.pure-u-1-1', [
        h('h2.title.settings-title', [
          'Server Settings'
        ])
      , h('.p.subtitle', conn.name)
      ])
    ])
  , h('#settings.settings-container', [
      h('.form.form-dark.col-sm-8.col-sm-offset-1', [
        h('form.form', [
          h('h3.form-title', 'Connection Settings')
        , this.checkbox.render({
            id: 'connect.auto'
          , title: 'Auto Connect'
          , note: 'Auto connect on load'
          }, settings)
        , this.checkbox.render({
            id: 'log.events'
          , title: 'Show General Events'
          , note: 'Log general channel events like JOIN and PART messages'
          }, settings)
        , this.checkbox.render({
            id: 'persist.password'
          , title: 'Persist Password'
          , note: 'Stores the password in the system keychain'
          }, settings)
        , group(
            'messages.limit'
          , 'number'
          , 'Max messages to keep in memory'
          , settings.get('messages.limit')
          , true
          , settings.get('messages.limit')
          )
        , checkbox({
            id: 'transcripts.enabled'
          , text: 'Log transcripts'
          , checked: settings.get('transcripts.enabled')
          , onchange: (e) => {
              this.logOnChange(e, conn)
            }
          })
        , disabledGroup({
            id: 'transcripts.location'
          , text: 'Log Location'
          , type: 'text'
          , placeholder: 'Log Location'
          , required: false
          , value: settings.get('transcripts.location') || ''
          })
        , group('part.message', 'text', 'Part Message', DEF, false, DEF)
        , h('.form-group', [
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
    h('label.control-label', {
      attributes: {
        for: opts.id
      }
    }, opts.text)
  , h('input.form-control', {
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
  return h('.form-group', [
    h('label.control-label', {
      attributes: {
        for: id
      }
    }, text)
  , h('input.form-control', {
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
  return h('.form-group', [
    h('.checkbox', [
      h('label', [
        h('input', {
          type: 'checkbox'
        , id: id
        , checked: checked
        , onchange: onchange
        })
      , h('.setting-title', ` ${text}`)
      ])
    ])
  ])
}

function $(str) {
  return document.getElementById(str)
}
