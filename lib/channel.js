'use strict'

const debug = require('debug')('eyearesee:channels')

module.exports = Channel

const colors = [
  'green', 'red', 'yellow', 'blue', 'purple', 'orange'
, 'green1', 'red1', 'yellow1', 'blue1', 'purple1', 'orange1'
, 'green2', 'red2', 'yellow2', 'blue2', 'purple2', 'orange2'
, 'green3', 'red3', 'yellow3', 'blue3', 'purple3', 'orange3'
, 'green4', 'red4', 'yellow4', 'blue4', 'purple4', 'orange4'
, 'green5', 'red5', 'yellow5', 'blue5', 'purple5', 'orange5'
]
function Channel(opts) {
  if (!(this instanceof Channel))
    return new Channel(opts)

  this.name = opts.name
  this.topic = opts.topic || ''
  this.nick = opts.nick || ''
  this.logs = opts.logs || []
  this.unread = opts.unread || 0
  this.userMap = new Map()
  this.setNames()
}

Channel.prototype.nextColor = function nextColor() {
  const color = colors.shift()
  colors.push(color)
  return color
}

Channel.prototype.removeUser = function removeUser(name) {
  debug('removeUser %s', name)
  if (!this.userMap.has(name)) {
    debug('userMap does not have user')
    return
  }

  this.userMap.delete(name)

  const names = this.names.filter(function(item) {
    return item.name !== name
  })

  this.setNames(names)
}

Channel.prototype.addUser = function addUser(name, mode) {
  const color = this.nextColor()
  this.userMap.set(name, color)
  this.names.push({
    name: name
  , mode: mode
  })

  this.setNames(this.names)
}

// TODO(evanlucas) Come up with a less shitty way of doing this
Channel.prototype.setNames = function setNames(names) {
  this.names = (names || []).sort(function(a, b) {
    if (a.mode === b.mode) {
      return a.name < b.name
        ? -1
        : a.name > b.name
        ? 1
        : 0
    }

    if (a.mode > b.mode) {
      return -1
    } else if (a.mode < b.mode) {
      return 1
    }
  })

  for (var i = 0, len = this.names.length; i < len; i++) {
    // only set it if one isn't already set
    if (!this.userMap.has(this.names[i].name)) {
      this.userMap.set(this.names[i].name, this.nextColor())
    }
  }
}
