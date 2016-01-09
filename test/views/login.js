'use strict'

const test = require('tap').test
const LoginView = require('../../lib/views/login')

test('LoginView', (t) => {
  t.plan(47)
  const app = {
    nav: {}
  }

  const view = new LoginView(app)

  const v = view.render()
  
  const verify = Verify(t)
  verify(v, 'DIV', { id: 'loginForm' }, 2, 'loginForm')

  const h3 = v.children[0]
  verify(h3, 'H3', {}, 1, 'h3')
  const h3Text = h3.children[0]
  t.equal(h3Text.text, 'Login')

  const form = v.children[1]
  verify(form, 'FORM', {
    className: 'pure-form pure-form-aligned'
  }, 1, 'form')

  const fieldset = form.children[0]
  verify(fieldset, 'FIELDSET', {}, 8, 'fieldset')

  const usernameCG = fieldset.children[0]
  verify(usernameCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'username control group')

  const realnameCG = fieldset.children[1]
  verify(realnameCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'realname control group')

  const nicknameCG = fieldset.children[2]
  verify(nicknameCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'nickname control group')

  const passwordCG = fieldset.children[3]
  verify(passwordCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'password control group')

  const altusernameCG = fieldset.children[4]
  verify(altusernameCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'altusername control group')

  const serverurlCG = fieldset.children[5]
  verify(serverurlCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'serverurl control group')

  const portCG = fieldset.children[6]
  verify(portCG, 'DIV', {
    className: 'pure-control-group'
  }, 2, 'port control group')

  const controls = fieldset.children[7]
  verify(controls, 'DIV', {
    className: 'pure-controls'
  }, 1, 'controls')

  var opts = {
    username: 'evanlucas'
  , realname: 'Evan Lucas'
  , nickname: 'evanlucas'
  , password: 'password'
  , altusername: 'evanluca_'
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
    t.equal(options.altnick, opts.altusername)
    t.equal(options.host, opts.serverurl)
    t.equal(options.port, opts.port)
  }

  const button = controls.children[0]
  const props = button.properties
  t.equal(props.hasOwnProperty('onclick'), true, 'button has onclick')
  props.onclick({
    preventDefault: function() {
      t.pass('called preventDefault')
    }
  })
})

function Verify(t) {
  return function(node, tagName, props, kids, type) {
    t.equal(node.tagName, tagName, `${type} tagName`)
    t.deepEqual(node.properties, props, `${type} properties`)
    t.equal(node.children.length, kids, `${type} children.length`)
  }
}
