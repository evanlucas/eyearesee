'use strict'

const test = require('tap').test
const View = require('../../../lib/views/components/setting-checkbox')
const IRC = require('eyearesee-client')
const Settings = IRC.Settings

test('SettingCheckbox', (t) => {
  const defs = new Map([[ 'test', true ]])
  const target = {
    needsLayout: () => {
      t.pass('called target.needsLayout')
    }
  , settings: new Settings(defs)
  }

  const view = View(target)

  target.settings.on('settingChanged', (key, orig, val) => {
    t.equal(key, 'test', 'key')
    t.equal(orig, undefined, 'old value')
    t.equal(val, false, 'new value')
  })

  const out = view.render({
    id: 'test'
  , title: 'test'
  , note: 'NOTE'
  })

  t.equal(out.children.length, 1, 'children')
  let kid = out.children[0]
  t.equal(kid.children.length, 1, 'children')
  kid = kid.children[0]
  t.equal(kid.children.length, 3, 'children')

  const input = kid.children[0]
  t.equal(input.tagName, 'INPUT', 'tagName')
  t.equal(input.properties.checked, true, 'checked')

  input.properties.onchange({
    target: {
      checked: false
    }
  })

  const title = kid.children[1]
  t.equal(title.properties.className, 'setting-title', 'className')

  const note = kid.children[2]
  t.equal(note.properties.className, 'form-control-static', 'className')

  t.end()
})
