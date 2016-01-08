'use strict'

const debug = require('debug')('eyearesee:handlers:join')

module.exports = function handleJoin(msg, conn) {
  debug('join event', msg)
  const channel = msg.channel.toLowerCase()
  const nick = msg.nick

  if (!conn.channels.has(channel)) {
    debug('cannot find channel', msg)
    return
  }

  const chan = conn.channels.get(channel)

  if (nick === conn.user.nickname) {
    // we just joined, so just show the channel
    debug('we joined %s', channel)
    conn.showChannel(chan)
  } else {
    // the second arg is the mode.
    // is there a way to get this from the message?
    const obj = {
      nickname: msg.nick
    , username: msg.hostmask.username
    , address: msg.hostmask.hostname
    , realname: ''
    , mode: ''
    , color: null
    }
    chan.addUser(obj)
    debug('someone else joined %s %s', msg.nick, msg.channel)
    conn.render()
  }
}
