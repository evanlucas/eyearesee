'use strict'

const test = require('tap').test
const ChannelsView = require('../../../lib/views/sidebar/channels')
const common = require('../../common')
const IRC = require('eyearesee-client')
const Channel = IRC.Channel

test('ChannelsView', (t) => {
  const chan = new Channel({
    name: '#node.js'
  , unread: 1
  , active: true
  , connection: {
      name: 'Freenode'
    , emit: () => {}
    , url: '/connections/Freenode'
    , channels: new Map()
    }
  })

  const app = {
    url: '/'
  , router: {
      goto: (u) => {
        app.url = u
      }
    }
  }

  const view = new ChannelsView(app)
  const chans = new Map()
  const verify = common.VerifyNode(t)

  let v = view.render(chans)
  t.deepEqual(v, [], 'no channels returns empty array')

  chans.set('#node.js', chan)

  v = view.render(chans)

  const li = v[0]

  verify(li, 'LI', {
    className: 'pure-menu-item not-joined'
  }, 1, 'li')

  const a = li.children[0]
  verify(a, 'A', {
    href: '#node.js'
  , id: 'channel-#node.js'
  , className: 'pure-menu-link'
  , key: null
  , attributes: {
      navtype: 'channel'
    , navname: '#node.js'
    , connection: 'Freenode'
    , tabindex: '-1'
    }
  }, 2, 'a')

  const txt = a.children[0]
  t.equal(txt.text, '#node.js')

  const div = a.children[1]
  verify(div, 'DIV', {
    className: 'badge'
  }, 1, 'badge')

  const badgeTxt = div.children[0]
  t.equal(badgeTxt.text, '1')

  // Now, try calling the onclick handler

  const opts = {
    preventDefault: function() {
      t.pass('called preventDefault')
    }
  , target: {
      classList: new Set()
    }
  }
  a.properties.onclick(opts)

  t.end()
})
