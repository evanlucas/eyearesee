'use strict'

const debug = require('debug')('eyearesee:handlers:nick')

module.exports = function handleNick(msg, conn) {
  const newNick = msg.new
  const oldNick = msg.nick
  const hostmask = msg.hostmask

  if (conn.user.nickname === oldNick) {
    debug('I changed my nick from %s to %s', oldNick, newNick)
    conn.user.nickname = newNick
    conn.handleNickChange({
      from: oldNick
    , to: newNick
    , hostmask: hostmask
    })
  } else {
    debug('%s changed their nick to %s', oldNick, newNick)
    conn.handleNickChange({
      from: oldNick
    , to: newNick
    , hostmask: hostmask
    })
  }
}
