'use strict'

const test = require('tap').test
const LoginView = require('../../lib/views/login')
const common = require('../common')

test('LoginView', (t) => {
  t.plan(122)

  const app = {
    nav: {}
  }

  const view = new LoginView(app)

  const v = view.render()

  const verify = common.VerifyNode(t)

  function verifyGroup(node, id, type, text, ph, req) {
    verify(node, 'DIV', { className: 'group' }, 2, type)

    const span = node.children[0]
    verify(span, 'SPAN', {
      className: 'label'
    , attributes: {
        for: id
      }
    }, 1, `${text} span`)

    const spanText = span.children[0]
    t.equal(spanText.text, text)

    const input = node.children[1]
    verify(input, 'INPUT', {
      className: 'input'
    , id: id
    , type: type
    , placeholder: ph
    , required: req
    }, 0, `${text} input`)
  }

  function verifyCB(node, id, text, checked) {
    verify(node, 'DIV', {
      className: 'checkbox'
    }, 1, `${text} checkbox group`)

    const label = node.children[0]
    verify(label, 'LABEL', {
      attributes: {
        for: id
      }
    }, 2, `${text} label`)

    const input = label.children[0]
    verify(input, 'INPUT', {
      type: 'checkbox'
    , id: id
    , checked: checked
    }, 0, `${text} input`)

    const textPart = label.children[1]
    t.equal(textPart.text, ` ${text}`)
  }

  verify(v, 'DIV', { id: 'login' }, 1, 'loginForm')

  const formClass = v.children[0]
  verify(formClass, 'DIV', {
    className: 'form'
  }, 2, 'formClass')

  const close = formClass.children[0]
  verify(close, 'A', {
    className: 'close'
  , innerHTML: '&times;'
  }, 0, 'close')

  const form = formClass.children[1]
  verify(form, 'FORM', {}, 11, 'form')

  const h3 = form.children[0]
  verify(h3, 'H3', {}, 1)

  const h3text = h3.children[0]
  t.equal(h3text.text, 'Create Connection')

  // username group
  const username = form.children[1]
  verifyGroup(
    username
  , 'username'
  , 'text'
  , 'Username'
  , 'Username'
  , true
  )

  const realname = form.children[2]
  verifyGroup(
    realname
  , 'realname'
  , 'text'
  , 'Real Name'
  , 'Real Name'
  , true
  )

  const nickname = form.children[3]
  verifyGroup(
    nickname
  , 'nickname'
  , 'text'
  , 'Nickname'
  , 'Nickname'
  , true
  )

  const password = form.children[4]
  verifyGroup(
    password
  , 'password'
  , 'password'
  , 'Password'
  , 'Password'
  , true
  )

  const altnick = form.children[5]
  verifyGroup(
    altnick
  , 'altnick'
  , 'text'
  , 'Alt. Nick'
  , 'Alt. Nick'
  , false
  )

  const serverurl = form.children[6]
  verifyGroup(
    serverurl
  , 'serverurl'
  , 'text'
  , 'Server'
  , 'irc.freenode.org'
  , true
  )

  const port = form.children[7]
  verifyGroup(
    port
  , 'port'
  , 'number'
  , 'Port'
  , '6667'
  , true
  )

  const autoConnect = form.children[8]
  verifyCB(autoConnect, 'autoConnect', 'Auto Connect', true)

  const showEvents = form.children[9]
  verifyCB(showEvents, 'showEvents', 'Show General Events', true)

  const input = form.children[10]
  verify(input, 'INPUT', {
    id: 'loginButton'
  , type: 'submit'
  }, 1, 'create connection input')

  const inputText = input.children[0]
  t.equal(inputText.text, 'Create Connection')

  var opts = {
    username: 'evanlucas'
  , realname: 'Evan Lucas'
  , nickname: 'evanlucas'
  , password: 'password'
  , altnick: 'evanluca_'
  , serverurl: 'chat.freenode.org'
  , port: 6667
  }

  if (typeof document === 'undefined') {
    global.document = {
      getElementById: function(str) {
        if (opts[str]) {
          return {
            value: opts[str]
          }
        }
      }
    }
  }

  app.login = function(options) {
    t.pass('called login')
    t.equal(options.username, opts.username)
    t.equal(options.realname, opts.realname)
    t.equal(options.nickname, opts.nickname)
    t.equal(options.password, opts.password)
    t.equal(options.altnick, opts.altnick)
    t.equal(options.host, opts.serverurl)
    t.equal(options.port, opts.port)
  }

  const props = input.properties
  t.equal(props.hasOwnProperty('onclick'), true, 'button has onclick')
  props.onclick({
    preventDefault: function() {
      t.pass('called preventDefault')
    }
  })

  // now let's click cancel
  const conn = {
    name: 'Freenode'
  , active: true
  }

  app.connections = new Map([[ 'Freenode', conn ]])
  app.nav.showConnection = function(conn) {
    t.equal(conn.name, 'Freenode', 'connection name is correct')
  }

  const e = {
    preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  close.properties.onclick(e)
})
