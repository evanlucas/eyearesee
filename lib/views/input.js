'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const parse = require('../parse-message')
const debug = require('debug')('eyearesee:views:input')
const argsplit = require('argsplit')
const completor = require('completor')
const CommandBar = require('./command-bar')
const Events = require('../dom-events')

const MAX_HISTORY_SIZE = 30

module.exports = Input

function Input(target) {
  if (!(this instanceof Input))
    return new Input(target)

  this.history = []
  this.historyIndex = -1
  this.line = ''
  this.isTabbing = false
  this._tabChar = ''
  this._tabOrig = ''
  Base.call(this, target)

  this.commandBar = new CommandBar(target, this)
  this._prevented = null
}
inherits(Input, Base)

Input.prototype.addLine = function addLine(line) {
  debug('addLine %s', line)
  if (!line) return ''
  if (this.history.length === 0 || this.history[0] !== line) {
    this.history.unshift(line)

    if (this.history.length > MAX_HISTORY_SIZE)
      this.history.pop()
  }

  this.historyIndex = -1
  return this.line = this.history[0]
}

Input.prototype._historyNext = function _historyNext(node) {
  if (this.historyIndex > 0) {
    this.historyIndex--
    this.line = this.history[this.historyIndex]
    node.value = this.line
  } else if (this.historyIndex === 0) {
    this.historyIndex = -1
    this.line = ''
    node.value = this.line
  }
}

Input.prototype._historyPrev = function _historyPrev(node) {
  if (this.historyIndex + 1 < this.history.length) {
    this.historyIndex++
    this.line = this.history[this.historyIndex]
    node.value = this.line
  }
}

const inputRE = /\/([a-zA-Z]+)?$/

Input.prototype.onInput = function onInput(e) {
  const node = e.target
  if (inputRE.test(node.value)) {
    debug('onInput update filter %s', node.value)
    this.commandBar.updateFilter(node.value)
  } else {
    this.commandBar.updateFilter('')
  }

  this.refresh()
}

Input.prototype.preventKeyup = function preventKeyup(code) {
  this._prevented = code
}

Input.prototype.onKeyup = function onKeyup(e, nav) {
  const code = e.which
  const node = e.target

  debug('keyup command bar showing %s', this.commandBar.isShowing())

  if (this._prevented === code) {
    this._prevented = null
    debug('keyup prevent', code)
    e.preventDefault()
    return false
  }

  printCode(code, 'keyup')

  switch (code) {
    case Events.KEYS.BACKSPACE:
      this.commandBar.updateFilter(node.value)
      return this.refresh(true)
      break
  }
}

function printCode(code, ev) {
  debug('%s %s', ev, Events.nameForCode(code))
}

Input.prototype.onKeydown = function onKeydown(e, nav) {
  const code = e.which
  const node = e.target
  // node.value will not take the current keystroke into account
  const barShowing = this.commandBar.isShowing()

  if (Events.isSLASH(code) && !barShowing) {
    this.commandBar.show()
    return
  }

  if (!Events.isKeydown(code) && barShowing) {
    return
  }

  if (Events.isTAB(code)) {
    e.preventDefault()
  }

  if (barShowing) {
    printCode(code, 'keydown')
    switch (code) {
      case Events.KEYS.ESC:
        this.commandBar.updateFilter('')
        return this.refresh(false)
      case Events.KEYS.ENTER:
        e.preventDefault()
        node.value = this.commandBar.select()
        // Prevent ENTER keyup when we select
        this.preventKeyup(code)
        return this.refresh(false)
      case Events.KEYS.UP:
        e.preventDefault()
        node.value = this.commandBar.prev() || '/'
        this.preventKeyup(code)
        return this.refresh(false)
      case Events.KEYS.DOWN:
        e.preventDefault()
        node.value = this.commandBar.next() || '/'
        this.preventKeyup(code)
        return this.refresh(false)
      case Events.KEYS.SPACE:
        // hide the commandbar
        this.commandBar.hide()
        return this.refresh(false)
        break
    }
  } else {
    if (!Events.isTAB(code) && this.isTabbing) {
      this.isTabbing = false
      this._tabChar = ''
      this._tabOrig = ''
    }

    switch (code) {
      case Events.KEYS.ENTER:
        // we know that the value is already set here,
        // so just fire off the command
        if (!node.value) return
        const msg = parse(node.value)
        this.addLine(node.value)
        node.value = ''
        this.send('command', msg)
        break
      case Events.KEYS.UP:
        e.preventDefault()
        this._historyPrev(node)
        return false
      case Events.KEYS.DOWN:
        e.preventDefault()
        this._historyNext(node)
        return false
      case Events.KEYS.TAB:
        if (!node.value) {
          debug('no completions, empty value')
          return
        }
        if (nav.current.type === 'channel' || nav.current.type === 'private') {
          const value = argsplit(node.value)
          let val = value[value.length - 1]
          debug('completion val %s', val)
          if (!val) return
          if (this._tabOrig) {
            value[value.length - 1] = this._tabOrig
            debug('_tabOrig exists, new value', value, this._tabOrig)
          } else {
            this._tabOrig = val
            debug('_tabOrig does not exist, set to val', val)
          }

          debug('getting completions for %s', this._tabOrig)
          const names = completor(this._tabOrig, nav.current._onlyNames)
          debug('names %j', names)

          if (!names.length) return

          if (this.isTabbing) {
            // go to the next item in the list
            let idx = names.indexOf(val)
            if (idx > -1) {
              // found a match
              // go to the next one if it exists
              if (idx < names.length - 1) {
                idx++
              } else {
                // at the end
                // grab the first
                idx = 0
              }
              value[value.length - 1] = names[idx]
              this._tabChar = val
              node.value = value.join(' ')
            } else {
              // couldn't find anything
              debug('no matches found')
              return
            }
          } else {
            this.isTabbing = true
            this._tabChar = val
            this._tabOrig = val
            value[value.length - 1] = names[0]
            node.value = value.join(' ')
          }
        }
        break
    }
  }
}

Input.prototype.refresh = function refresh(ret) {
  this.target.needsLayout()
  return ret
}

Input.prototype.render = function render(nav) {
  return [
    h('#inputContainer', [
      h('#footer', [
        this.commandBar.render()
      , h('input.inputMessage', {
          id: 'inputMessage'
        , type: 'text'
        , placeholder: 'Send message...'
        , onkeydown: (e) => {
            this.onKeydown(e, nav)
          }
        , onkeyup: (e) => {
            this.onKeyup(e, nav)
          }
        , oninput: (e) => {
            this.onInput(e)
          }
        })
      ])
    ])
  ]
}
