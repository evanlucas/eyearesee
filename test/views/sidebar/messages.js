'use strict'

const test = require('tap').test
const MessagesView = require('../../../lib/views/sidebar/messages')
const common = require('../../common')
const IRC = require('eyearesee-client')
const Channel = IRC.Channel

test('MessagesView', (t) => {
  const chan = new Channel({
    name: '#node.js'
  , unread: 1
  , active: true
  , url: '/'
  , connection: {
      name: 'Freenode'
    , emit: () => {}
    , url: '/connections/Freenode'
    }
  })

  const app = {
    router: {
      goto: (u) => {
        app.url = u
      }
    }
  }

  const view = new MessagesView(app)
  const chans = new Map()
  const verify = common.VerifyNode(t)

  let v = view.render(chans)
  t.deepEqual(v, [], 'no channels returns empty array')

  chans.set('#node.js', chan)

  v = view.render(chans)

  const li = v[0]

  verify(li, 'LI', {
    className: 'pure-menu-item'
  }, 1, 'li')

  const a = li.children[0]
  verify(a, 'A', {
    href: '#node.js'
  , id: 'channel-#node.js'
  , className: 'pure-menu-link'
  , attributes: {
      navtype: 'private'
    , navname: '#node.js'
    , connection: 'Freenode'
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
  , target: {}
  }
  a.properties.onclick(opts)

  t.end()
})
