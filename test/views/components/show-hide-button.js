'use strict'

const test = require('tap').test
const Button = require('../../../lib/views/components/show-hide-button')
const common = require('../../common')
const IRC = require('eyearesee-client')
const Settings = IRC.Settings

test('ShowHideButton', (t) => {
  t.plan(24)
  const verify = common.VerifyNode(t)

  const app = {
    settings: new Settings()
  , needsLayout: () => {
      t.pass('called needsLayout')
    }
  }

  app.settings.once('settingChanged', (key, orig, val) => {
    t.pass('called set')
    t.equal(key, 'userbar.hidden', 'key')
    t.equal(val, true, 'value')
  })

  const btn = new Button(app)
  let res = btn.render(false)

  verify(res, 'BUTTON', {
    id: 'showHideButton'
  , className: 'btn btn-primary'
  , tabindex: '-1'
  , attributes: {
      tabindex: '-1'
    }
  }, 1, 'show hide button')

  let i = res.children[0]
  verify(i, 'I', {
    className: 'fa fa-chevron-right'
  }, 0, 'icon')

  const obj = {
    preventDefault: () => {
      t.pass('called preventDefault()')
    }
  , target: {
      blur: () => {
        t.pass('called blur')
      }
    }
  }

  res.properties.onclick(obj)

  app.settings.once('settingChanged', (key, orig, val) => {
    t.pass('called set')
    t.equal(key, 'userbar.hidden', 'key')
    t.equal(val, false, 'value')
  })

  res = btn.render(true)

  verify(res, 'BUTTON', {
    id: 'showHideButton'
  , className: 'btn btn-primary'
  , tabindex: '-1'
  , attributes: {
      tabindex: '-1'
    }
  }, 1, 'show hide button')

  i = res.children[0]
  verify(i, 'I', {
    className: 'fa fa-chevron-left'
  }, 0, 'icon')

  res.properties.onclick(obj)
})
