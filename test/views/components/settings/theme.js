'use strict'

const test = require('tap').test
const View = require('../../../../lib/views/components/settings/theme')
const Theme = require('../../../../lib/themes/theme')
const common = require('../../../common')
const IRC = require('eyearesee-client')
const Settings = IRC.Settings

test('SettingThemeSelect', (t) => {
  t.plan(29)
  const themes = new Map()
  themes.set('dusk.css', new Theme(null, '/dusk.css', 'dusk.css', true))
  themes.set('user.css', new Theme(null, '/user.css', 'user.css', false))

  const defs = new Map([[ 'color', '#fff' ]])
  const target = {
    needsLayout: () => {
      t.pass('called target.needsLayout')
    }
  , settings: new Settings(defs)
  , themes: {
      themes: themes
    , load: (a, cb) => {
        t.pass('called themes.load()')
        cb()
      }
    , activate: (name) => {
        t.pass('called themes.activate()')
      }
    }
  }

  const verify = common.VerifyNode(t)

  const view = View(target)

  target.settings.once('settingChanged', (key, orig, val) => {
    t.equal(key, 'theme.active', 'key')
    t.equal(orig, undefined, 'old value')
    t.equal(val, 'user.css', 'new value')
  })

  const out = view.render({
    id: 'theme.active'
  , title: 'Theme'
  , note: 'Click reload to reload your themes.'
  })

  verify(out, 'DIV', {
    className: 'form-group'
  }, 3, 'wrapper')

  let kids = out.children
  const label = kids[0]
  verify(label, 'LABEL', {
    className: 'control-label'
  , attributes: {
      for: 'theme.active'
    }
  }, 1, 'label')

  const select = kids[1]
  verify(select, 'SELECT', {
    className: 'form-control'
  }, 2, 'select')

  const options = select.children
  const o1 = options[0]
  verify(o1, 'OPTION', {
    selected: true
  }, 1, 'option 1')

  t.equal(o1.children[0].text, 'dusk.css', 'option 1 text')

  const o2 = options[1]
  verify(o2, 'OPTION', {
    selected: false
  }, 1, 'option 2')

  t.equal(o2.children[0].text, 'user.css', 'option 2 text')

  select.properties.onchange({
    target: {
      value: 'user.css'
    }
  })

  const p = kids[2]
  verify(p, 'P', {
    className: 'form-control-static'
  }, 2, 'p')

  const txt = p.children[0]
  t.equal(txt.text, 'Click reload to reload your themes.', 'note text')

  const reload = p.children[1]
  verify(reload, 'BUTTON', {
    tabindex: '-1'
  , attributes: {
      tabindex: '-1'
    }
  , className: 'btn btn-link'
  }, 1, 'reload button')

  t.equal(reload.children[0].text, 'Reload', 'reload button text')

  reload.properties.onclick({
    target: {
      blur: () => {
        t.pass('called blur on reload button')
      }
    }
  })
})
