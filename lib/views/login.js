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
  , altnick: $('altnick').value
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
      , group({
          type: 'text'
        , id: 'username'
        , placeholder: 'Username'
        , required: true
        }, 'Username')
      , group({
          type: 'text'
        , id: 'realname'
        , placeholder: 'Real Name'
        , required: true
        }, 'Real Name')
      , group({
          type: 'text'
        , id: 'nickname'
        , placeholder: 'Nickname'
        , required: true
        }, 'Nickname')
      , group({
          type: 'password'
        , id: 'password'
        , placeholder: 'Password'
        , required: true
        }, 'Password')
      , group({
          type: 'text'
        , id: 'altnick'
        , placeholder: 'Alt. Nick'
        , required: false
        }, 'Alt. Nick')
      , group({
          type: 'text'
        , id: 'serverurl'
        , placeholder: 'chat.freenode.net'
        , required: true
        }, 'Server')
      , group({
          type: 'number'
        , id: 'port'
        , placeholder: '6667'
        , min: 0
        , max: 65535
        , required: true
        }, 'Port')
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

function group(props, text) {
  return h('.group', [
    h('span.label', {
      attributes: {
        for: props.id
      }
    }, text)
  , h('input.input', props)
  ])
}

function $(str) {
  return document.getElementById(str)
}
