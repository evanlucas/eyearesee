'use strict'

const debug = require('debug')('eyearesee:handlers:join')

const joinMsg = 'joined the channel'
module.exports = function handleJoin(msg, conn) {
  debug('join', msg)
  const channel = msg.channel.toLowerCase()
  const nick = msg.nick

  if (!conn.channels.has(channel)) {
    // create the channel
    if (nick === conn.user.nick
      || msg.hostmask.username.slice(1) === conn.user.username) {

      // add the channel
      const chan = conn.addChannel({
        name: msg.channel
      , topic: ''
      , nick: nick
      }, true)
      chan.joined = true
      conn.render()
    }
    return
  }

  const chan = conn.channels.get(channel)

  // if it is our nick, then we just joined the channel
  // don't do anything, because the user could be creating
  // a new connection or something like that.
  if (nick !== conn.user.nickname) {
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
    if (conn.settings.get('showEvents')) {
      chan.addMessage({
        message: `${msg.nick} (${obj.username}@${obj.address}) ${joinMsg}`
      , type: 'join'
      , to: null
      , from: null
      , hostmask: msg.hostmask
      , mention: false
      })
    }
    conn.render()
  } else {
    chan.joined = true
    conn.write(`TOPIC ${chan.name}`)
    conn.render()
  }
}
