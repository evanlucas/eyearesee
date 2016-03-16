'use strict'

// Navigation keyCodes
const BACKSPACE = 8
const TAB = 9
const ENTER = 13
const SHIFT = 16
const ESC = 27
const SPACE = 32
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const SLASH = 191 // will be 47 in the keypress event

const KEYS = {
  BACKSPACE: BACKSPACE
, TAB: TAB
, ENTER: ENTER
, SHIFT: SHIFT
, ESC: ESC
, SPACE: SPACE
, LEFT: LEFT
, UP: UP
, RIGHT: RIGHT
, DOWN: DOWN
, SLASH: SLASH
}

const NAV = {
  LEFT: LEFT
, UP: UP
, RIGHT: RIGHT
, DOWN: DOWN
}

const KEYDOWN_EVENTS = {
  LEFT: LEFT
, UP: UP
, RIGHT: RIGHT
, DOWN: DOWN
, BACKSPACE: BACKSPACE
, ESC: ESC
, ENTER: ENTER
, TAB: TAB
}

const NAV_VALUES = {}
const KEYDOWN_VALUES = {}
const KEY_VALUES = {}

exports.KEYS = KEYS
exports.NAV = NAV
exports.KEYDOWN_EVENTS = KEYDOWN_EVENTS

const keys = Object.keys(KEYS)
for (let i = 0; i < keys.length; i++) {
  const key = keys[i]
  const code = KEYS[key]

  if (NAV[key]) {
    NAV_VALUES[code] = key
  }

  if (KEYDOWN_EVENTS[key]) {
    KEYDOWN_VALUES[code] = key
  }

  KEY_VALUES[code] = key

  exports[`is${key}`] = function(e) {
    return e === code
  }
}

exports.isNav = function isNav(e) {
  return NAV_VALUES.hasOwnProperty(e)
}

exports.isKeydown = function isKeydown(e) {
  return KEYDOWN_VALUES.hasOwnProperty(e)
}

exports.nameForCode = function nameForCode(e) {
  return KEY_VALUES[e] || e
}
