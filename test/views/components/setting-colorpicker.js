'use strict'

const test = require('tap').test
const View = require('../../../lib/views/components/setting-colorpicker')
const IRC = require('eyearesee-client')
const Settings = IRC.Settings

test('SettingColorPicker', (t) => {
  const defs = new Map([[ 'color', '#fff' ]])
  const target = {
    needsLayout: () => {
      t.pass('called target.needsLayout')
    }
  , settings: new Settings(defs)
  }

  const view = View(target)

  target.settings.on('settingChanged', (key, orig, val) => {
    t.equal(key, 'color', 'key')
    t.equal(orig, undefined, 'old value')
    t.equal(val, '#000', 'new value')
  })

  const out = view.render({
    id: 'color'
  , title: 'test'
  , note: 'NOTE'
  })

  t.equal(out.children.length, 3, 'children')
  const label = out.children[0]
  t.equal(label.children.length, 1, 'children')

  const inputGroup = out.children[1]
  t.equal(inputGroup.children.length, 2, 'children')

  const input = inputGroup.children[1]
  t.equal(input.properties.value.value, '#fff', 'value')

  input.properties.onkeyup({
    target: {
      value: '#000'
    }
  })

  const note = out.children[2]
  t.equal(note.children.length, 1, 'children')

  t.end()
})
