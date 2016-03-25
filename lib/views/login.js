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
  , name: $('name').value
  }

  if (!opts.username) {
    return false
  }

  this.target.login(opts)
}

Login.prototype.clickCancel = function clickCancel(e) {
  e.preventDefault()
  this.target.router.goto('/connection')
}

Login.prototype.render = function render() {
  return h('div#login.settings-container', [
    h('.form.form-dark.col-sm-8.col-sm-offset-1', [
      h('form.form', [
        h('h3.form-title', 'Create Connection')
      , h('br')
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
      , group({
          type: 'text'
        , id: 'name'
        , placeholder: 'Freenode'
        , required: true
        }, 'Connection Name')
      , h('.form-group', [
          h('.col-sm-6', [
            h('button#cancelBtn.btn.btn-danger.btn-lg.btn-block', {
              onclick: (e) => {
                this.clickCancel(e)
                return false
              }
            }, 'Close')
          ])
        , h('.col-sm-6', [
            h('input#loginButton.btn.btn-primary.btn-lg.btn-block', {
              type: 'submit'
            , onclick: (e) => {
                this.clickedLogin(e)
                return false
              }
            }, 'Create Connection')
          ])
        ])
      ])
    ])
  ])
}

function checkbox(id, text, checked) {
  return h('.form-group', [
    h('.checkbox', [
      h('label', [
        h('input', {
          type: 'checkbox'
        , id: id
        , checked: checked
        })
      , h('.setting-title', ` ${text}`)
      ])
    ])
  ])
}

function group(props, text) {
  return h('.form-group', [
    h('label.control-label', {
      attributes: {
        for: props.id
      }
    }, text)
  , h('input.form-control', props)
  ])
}

function $(str) {
  return document.getElementById(str)
}
