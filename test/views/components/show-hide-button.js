'use strict'

const test = require('tap').test
const Button = require('../../../lib/views/components/show-hide-button')
const common = require('../../common')

test('ShowHideButton', (t) => {
  t.plan(21)
  const verify = common.VerifyNode(t)

  const app = {
    settings: {
      set: (k, v, cb) => {
        t.pass('called set')
        t.equal(k, 'hideUserbar', 'key')
        t.equal(v, true, 'value')
        cb()
      }
    }
  , needsLayout: () => {
      t.pass('called needsLayout')
    }
  }

  const btn = new Button(app)
  let res = btn.render(false)

  verify(res, 'BUTTON', {
    id: 'showHideButton'
  , className: 'btn btn-primary'
  }, 1, 'show hide button')

  let i = res.children[0]
  verify(i, 'I', {
    className: 'fa fa-chevron-right'
  }, 0, 'icon')

  const obj = {
    preventDefault: () => {
      t.pass('called preventDefault()')
    }
  }

  res.properties.onclick(obj)

  app.settings.set = function(k, v, cb) {
    t.pass('called set again')
    t.equal(k, 'hideUserbar', 'key')
    t.equal(v, false, 'value')
    cb(new Error('NOPE'))
  }

  res = btn.render(true)

  verify(res, 'BUTTON', {
    id: 'showHideButton'
  , className: 'btn btn-primary'
  }, 1, 'show hide button')

  i = res.children[0]
  verify(i, 'I', {
    className: 'fa fa-chevron-left'
  }, 0, 'icon')

  res.properties.onclick(obj)
})
