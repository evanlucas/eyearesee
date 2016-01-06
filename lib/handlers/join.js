'use strict'

const debug = require('debug')('eyearesee:handlers:join')
const ChannelView = require('../elements/channel')

module.exports = function handleJoin(msg, app) {
  debug('join event', msg)
  const channel = msg.channel
  const nick = msg.nick
  const chan = app.data.channels[channel]
  if (!chan) {
    debug('got join event for channel that doesnt exist', msg)
    return
  }

  if (nick === app.data.user.nickname) {
    // we just joined
    const view = new ChannelView(app)
    app.views.channels[channel] = view
    // have to render to add the view
    app.emit('render')

    // now we actually show the channel
    app.showChannel(channel)
  } else {
    // the second arg is the mode.
    // is there a way to get this from the message?
    chan.addUser(msg.nick, '')
    app.emit('render')
    debug('someone else joined %s %s', msg.nick, msg.channel)
  }
}
