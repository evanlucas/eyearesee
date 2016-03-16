'use strict'

const test = require('tap').test
const InputView = require('../../lib/views/input')
const EE = require('events')
const CommandManager = require('../../lib/command-manager')

test('InputView', (t) => {
  t.plan(56)
  const app = new EE()
  app.nav = {
    current: {
      type: 'channel'
    , _onlyNames: []
    }
  }

  app.commandManager = new CommandManager()

  const input = InputView(app)
  t.deepEqual(input.history, [])
  t.equal(input.historyIndex, -1)
  t.equal(input.line, '')
  t.equal(input.isTabbing, false)
  t.equal(input._tabChar, '')
  t.equal(input._tabOrig, '')

  const v = input.render(app.nav)

  t.type(v, Array)
  t.equal(v.length, 1)

  const i = v[0]
  t.equal(i.tagName, 'DIV')
  t.deepEqual(i.properties, { id: 'inputContainer' })

  const kids = i.children
  t.equal(kids.length, 1)
  t.equal(kids[0].tagName, 'DIV')
  t.deepEqual(kids[0].properties, { id: 'footer' })

  const kids2 = kids[0].children
  t.equal(kids2.length, 2)
  t.equal(kids2[0].tagName, 'DIV')
  t.match(kids2[0].properties, {
    id: 'commandbar'
  , className: 'panel panel-default'
  })

  // [ENTER]
  input.onKeydown({
    which: 13
  , target: {
      value: ''
    , type: 'text'
    }
  })

  let node = {
    value: 'Hello'
  , type: 'text'
  }

  app.once('command', (msg) => {
    t.deepEqual(msg, {
      type: '_message'
    , data: 'Hello'
    }, 'got Hello')
  })

  // Hello [ENTER]
  input.onKeydown({
    which: 13
  , target: node
  })

  t.equal(node.value, '')
  t.deepEqual(input.history, ['Hello'])
  t.equal(input.historyIndex, -1)

  let opts = {
    which: 38
  , target: {
      value: 'biscuits'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  // biscuits [UP]
  input.onKeydown(opts)

  t.equal(opts.target.value, 'Hello')
  t.deepEqual(input.history, ['Hello'])
  t.equal(input.historyIndex, 0)
  t.equal(input.line, 'Hello')

  node.value = 'biscuits'
  // biscuits [ENTER]
  input.onKeydown({
    which: 13
  , target: node
  })

  t.equal(node.value, '')
  t.deepEqual(input.history, ['biscuits', 'Hello'])
  t.equal(input.historyIndex, -1)

  // biscuits [UP]
  // Hello [DOWN]
  opts = {
    which: 38
  , target: {
      value: 'biscuits'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input.onKeydown(opts)

  opts = {
    which: 40
  , target: {
      value: 'Hello'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input.onKeydown(opts)
  t.equal(input.historyIndex, -1)
  t.deepEqual(input.history, ['biscuits', 'Hello'])
  t.equal(input.isTabbing, false)

  opts = {
    which: 9
  , target: {
      value: ''
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input.onKeydown(opts)
  t.equal(input.isTabbing, false)

  opts = {
    which: 9
  , target: {
      value: 'fasd'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input.onKeydown(opts, app.nav)
  // !names.length
  t.equal(input.isTabbing, false)

  opts = {
    which: 9
  , target: {
      value: 'ab'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input._tabOrig = ''
  app.nav.current._onlyNames = ['abc', 'abcd']
  input.onKeydown(opts, app.nav)
  t.equal(input.isTabbing, true)
  // the value changes from ab => abc
  t.equal(opts.target.value, 'abc')

  input.onKeydown(opts, app.nav)
  t.equal(input.isTabbing, true)
  t.equal(input._tabChar, 'abc')
  t.equal(input._tabOrig, 'ab')
  t.equal(opts.target.value, 'abcd')

  // one more time should take us back to abc
  input.onKeydown(opts, app.nav)
  t.equal(input.isTabbing, true)
  t.equal(input._tabChar, 'abcd')
  t.equal(input._tabOrig, 'ab')
  t.equal(opts.target.value, 'abc')

  // now check if there are no completions
  opts = {
    which: 9
  , target: {
      value: 'ab'
    , type: 'text'
    }
  , preventDefault: function() {
      t.pass('called preventDefault')
    }
  }

  input._tabOrig = ''
  input._tabChar = ''
  app.nav.current._onlyNames = ['abc']
  input.onKeydown(opts, app.nav)
  t.equal(input._tabChar, '')
  t.equal(input._tabOrig, 'ab')

  // now type another character
  opts = {
    which: 97
  , target: {
      value: 'ab'
    , type: 'text'
    }
  , preventDefault: function() {
      t.fail('called preventDefault')
    }
  }
  input.onKeydown(opts, app.nav)
  t.equal(input.isTabbing, false)
  t.equal(input._tabChar, '')
  t.equal(input._tabOrig, '')
})
