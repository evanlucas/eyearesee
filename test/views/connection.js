'use strict'

const test = require('tap').test
const View = require('../../lib/views/connection')
const common = require('../common')

test('Connection View', (t) => {
  const app = {
    router: {
      goto: (url) => {
        t.pass('called goto')
        t.equal(url, '/Freenode/settings', 'url is correct')
      }
    }
  }

  const verify = common.VerifyNode(t)

  const view = new View(app)
  t.type(view, View)
  t.equal(view.target, app)

  const conn = {
    name: 'Freenode'
  , url: '/Freenode'
  , server: {
      host: 'chat.freenode.net'
    , port: 6667
    }
  , logs: [
      { ts: new Date()
      , type: 'message'
      , formatted: ''
      }
    ]
  }

  const res = view.render(conn)

  t.type(res, Array)
  t.equal(res.length, 2, 'res.length')
  const header = res[0]
  verify(header, 'IRC-HEADER', {
    className: 'pure-g'
  }, 1, 'header')

  const headerBody = header.children[0]
  verify(headerBody, 'DIV', {
    className: 'pure-u-1-1'
  }, 3, 'header body')

  const settings = headerBody.children[0]
  verify(settings, 'A', {
    className: 'settings'
  }, 1, 'a.settings')

  const opts = {
    preventDefault: () => {
      t.pass('called preventDefault()')
    }
  }

  const out = settings.properties.onclick(opts)
  t.equal(out, false, 'onclick returns false')

  t.end()
})
