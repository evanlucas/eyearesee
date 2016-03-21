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
  this.target.showConnection()
}

Login.prototype.render = function render() {
  return h('div#login', [
    h('.form.col-sm-12', [
      h('form.form-horizontal', [
        h('h3', 'Create Connection')
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
      , checkbox('autoConnect', 'Auto Connect', true)
      , checkbox('showEvents', 'Show General Events', true)
      , h('.col-sm-3')
      , h('.col-sm-9', [
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
    h('.col-sm-offset-3.col-sm-9', [
      h('.checkbox', [
        h('label', [
          h('input', {
            type: 'checkbox'
          , id: id
          , checked: checked
          })
        , ` ${text}`
        ])
      ])
    ])
  ])
}

function group(props, text) {
  return h('.form-group', [
    h('label.control-label.col-sm-3', {
      attributes: {
        for: props.id
      }
    }, text)
  , h('.col-sm-6', [
      h('input.form-control', props)
    ])
  , h('.col-sm-3')
  ])
}

function $(str) {
  return document.getElementById(str)
}
