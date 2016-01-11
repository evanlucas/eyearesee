'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = Login

function Login(target) {
  if (!(this instanceof Login))
    return new Login(target)

  Base.call(this, target)
}
inherits(Login, Base)

Login.prototype.clickedLogin = function clickedLogin(e) {
  e.preventDefault()
  var opts = {
    username: $('username').value
  , realname: $('realname').value
  , nickname: $('nickname').value
  , password: $('password').value
  , altnick: $('altusername').value
  , host: $('serverurl').value
  , port: $('port').value
  }

  if (!opts.username) {
    return false
  }

  this.target.login(opts)
}

Login.prototype.clickCancel = function clickCancel(e) {
  e.preventDefault()

  const app = this.target
  const nav = app.nav
  let connection
  if (app.connections.size) {
    const conns = app.connections
    for (const conn of conns.values()) {
      connection = conn
      break
    }

    nav.showConnection(connection)
  }
}

Login.prototype.render = function render() {
  return h('div#login', [
    h('.form', [
      h('a.close', {
        innerHTML: '&times;'
      , onclick: (e) => {
          this.clickCancel(e)
        }
      })
    , h('form', [
        h('h3', 'Create Connection')
      , group('username', 'text', 'Username', 'Username', true)
      , group('realname', 'text', 'Real Name', 'Real Name', true)
      , group('nickname', 'text', 'Nickname', 'Nickname', true)
      , group('password', 'password', 'Password', 'Password', true)
      , group('altusername', 'text', 'Alt. Username', 'Alt. Username', false)
      , group('serverurl', 'text', 'Server', 'irc.freenode.org', true)
      , group('port', 'number', 'Port', '6667', true)
      , checkbox('autoConnect', 'Auto Connect', true)
      , checkbox('showEvents', 'Show General Events', true)
      , h('input#loginButton', {
          type: 'submit'
        , onclick: (e) => {
            this.clickedLogin(e)
          }
        }, 'Create Connection')
      ])
    ])
  ])
}

function checkbox(id, text, checked) {
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
      })
    , ` ${text}`
    ])
  ])
}

function group(id, type, text, ph, required) {
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
    })
  ])
}

function $(str) {
  return document.getElementById(str)
}
