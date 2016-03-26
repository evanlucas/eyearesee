'use strict'

const sounds = new Map([
  ['message', 'sound.message']
])

module.exports = class Notifications {
  constructor(app) {
    this.app = app
  }

  playSound(type) {
    if (sounds.has(type)) {
      const ele = document.getElementById(sounds.get(type))
      ele.play()
    }
  }
}
