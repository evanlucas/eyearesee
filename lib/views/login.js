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

  this.target.login(opts)
}

Login.prototype.render = function render() {
  return h('div#loginForm', [
      h('h3', 'Login')
    , h('form.pure-form.pure-form-aligned', [
        h('fieldset', [
          group('username', 'text', 'Username', 'Username', true)
        , group('realname', 'text', 'Real Name', 'Real Name', true)
        , group('nickname', 'text', 'Nickname', 'Nickname', true)
        , group('password', 'password', 'Password', 'Password', true)
        , group('altusername', 'text', 'Alt. Username', 'Alt. Username', false)
        , group('serverurl', 'text', 'Server', 'irc.freenode.org', true)
        , group('port', 'number', 'Port', '6667', true)
        , h('.pure-controls', [
            h('button#loginButton.pure-button.pure-button-primary', {
              type: 'submit'
            , onclick: (e) => {
                this.clickedLogin(e)
              }
            }, 'Login')
          ])
        ])
      ])
    ])
}

function group(id, type, text, ph, required) {
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
    , required: required
    })
  ])
}

function $(str) {
  return document.getElementById(str)
}
