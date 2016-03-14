'use strict'

module.exports = function channelWho(irc) {
  const client = irc.client

  client.on('data', (msg) => {
    if (msg.command === 'RPL_WHOREPLY') {
      const params = msg.params.split(' ')
      const channel = params[1].toLowerCase()
      const nick = (params[5] || '').toLowerCase()
      const u = (params[2] || '').toLowerCase()
      const rn = msg.trailing.split(' ')
      rn.shift()
      const opts = {
        nickname: nick
      , username: u
      , address: params[3]
      , realname: rn.join(' ')
      , mode: (params[6] || '').replace(/H|G/, '')
      , hostmask: {
          nick: nick
        , username: u
        , hostname: params[3]
        , string: msg.prefix
        }
      }

      irc.emit('who', channel, opts)
    } else if (msg.command === 'RPL_ENDOFWHO') {
      const channel = msg.params.split(' ')[1]
      irc.emit('who_end', channel)
    } else if (msg.command === 'RPL_TOPIC_WHO_TIME') {
      console.log('who_time', msg)
      const params = msg.params.split(' ')
      const out = {
        nickname: params[0]
      , channel: params[1]
      , date: new Date(+(params[3] + '000'))
      }

      irc.emit('topic_who_time', out)
    }
  })
}
