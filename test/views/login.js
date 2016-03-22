'use strict'

const test = require('tap').test
const LoginView = require('../../lib/views/login')
const common = require('../common')

test('LoginView', (t) => {
  t.plan(132)

  const app = {
    nav: {}
  }

  const view = new LoginView(app)

  const v = view.render()

  const verify = common.VerifyNode(t)

  function verifyGroup(node, id, type, text, ph, req, min, max) {
    verify(node, 'DIV', { className: 'form-group' }, 2, type)

    const span = node.children[0]
    verify(span, 'LABEL', {
      className: 'control-label'
    , attributes: {
        for: id
      }
    }, 1, `${text} span`)

    const spanText = span.children[0]
    t.equal(spanText.text, text)

    const outer = node.children[1]
    var opts = {
      className: 'form-control'
    , id: id
    , type: type
    , placeholder: ph
    , required: req
    }

    if (typeof min !== 'undefined')
      opts.min = min

    if (typeof max !== 'undefined')
      opts.max = max
    verify(outer, 'INPUT', opts, 0, type)
  }

  function verifyCB(node, id, text, checked) {
    // node is the form-group
    verify(node, 'DIV', {
      className: 'form-group'
    }, 1, `${text} form-group`)

    const child = node.children[0]
    verify(child, 'DIV', {
      className: 'checkbox'
    }, 1, `${text} col`)

    const label = child.children[0]

    verify(label, 'LABEL', {}, 2, `${text} checkbox`)

    const input = label.children[0]
    verify(input, 'INPUT', {
      type: 'checkbox'
    , id: id
    , checked: checked
    }, 0, `${text} input`)

    const textPart = label.children[1]
    verify(textPart, 'DIV', {
      className: 'setting-title'
    }, 1, 'setting-title')

    const c = textPart.children[0]
    t.equal(c.text, ` ${text}`)
  }

  verify(v, 'DIV', {
    id: 'login'
  , className: 'settings-container'
  }, 1, 'loginForm')

  const formClass = v.children[0]
  verify(formClass, 'DIV', {
    className: 'form form-dark col-sm-8 col-sm-offset-1'
  }, 1, 'formClass')

  const form = formClass.children[0]
  verify(form, 'FORM', {
    className: 'form'
  }, 12, 'form')

  const h3 = form.children[0]
  verify(h3, 'H3', {
    className: 'form-title'
  }, 1)

  const h3text = h3.children[0]
  t.equal(h3text.text, 'Create Connection')

  const br = form.children[1]
  verify(br, 'BR', {}, 0, 'br')

  // username group
  const username = form.children[2]
  verifyGroup(
    username
  , 'username'
  , 'text'
  , 'Username'
  , 'Username'
  , true
  )

  const realname = form.children[3]
  verifyGroup(
    realname
  , 'realname'
  , 'text'
  , 'Real Name'
  , 'Real Name'
  , true
  )

  const nickname = form.children[4]
  verifyGroup(
    nickname
  , 'nickname'
  , 'text'
  , 'Nickname'
  , 'Nickname'
  , true
  )

  const password = form.children[5]
  verifyGroup(
    password
  , 'password'
  , 'password'
  , 'Password'
  , 'Password'
  , true
  )

  const altnick = form.children[6]
  verifyGroup(
    altnick
  , 'altnick'
  , 'text'
  , 'Alt. Nick'
  , 'Alt. Nick'
  , false
  )

  const serverurl = form.children[7]
  verifyGroup(
    serverurl
  , 'serverurl'
  , 'text'
  , 'Server'
  , 'chat.freenode.net'
  , true
  )

  const port = form.children[8]
  verifyGroup(
    port
  , 'port'
  , 'number'
  , 'Port'
  , '6667'
  , true
  , 0
  , 65535
  )

  const autoConnect = form.children[9]
  verifyCB(autoConnect, 'autoConnect', 'Auto Connect', true)

  const showEvents = form.children[10]
  verifyCB(showEvents, 'showEvents', 'Show General Events', true)

  let col = form.children[11]
  verify(col, 'DIV', {
    className: 'form-group'
  }, 2, 'offset')

  const close = col.children[0].children[0]
  const input = col.children[1].children[0]

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

  app.showConnection = function() {}
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
