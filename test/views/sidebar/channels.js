'use strict'

const test = require('tap').test
const ChannelsView = require('../../../lib/views/sidebar/channels')
const common = require('../../common')

test('ChannelsView', (t) => {
  const chan = {
    name: '#node.js'
  , unread: 1
  , active: true
  , _connection: {
      name: 'Freenode'
    }
  }

  const app = {
    nav: {
      showChannel: function(c) {
        t.deepEqual(c, chan, 'showChannel called correctly')
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
    className: 'pure-menu-item'
  }, 1, 'li')

  const a = li.children[0]
  verify(a, 'A', {
    href: '#node.js'
  , id: 'channel-#node.js'
  , className: 'pure-menu-link active'
  , attributes: {
      navtype: 'channel'
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
  , target: {
      classList: new Set()
    }
  }
  a.properties.onclick(opts)

  t.equal(opts.target.classList.has('active'), true)

  t.end()
})
