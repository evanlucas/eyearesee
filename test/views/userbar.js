'use strict'

const test = require('tap').test
const Userbar = require('../../lib/views/userbar')
const common = require('../common')

test('UserbarView', (t) => {
  const app = {}

  const verify = common.VerifyNode(t)
  const view = Userbar(app)

  const names = [
    { mode: '@', name: 'evan' }
  , { mode: '+', name: 'evan2' }
  , { mode: '+', name: 'fred' }
  , { mode: '', name: 'biscuits' }
  ]

  const v = view.render(names)[0]

  verify(v, 'IRC-USERBAR', {}, 1, 'userbar')

  const users = v.children[0]
  verify(users, 'UL', {
    className: 'users'
  }, 4, 'ul.users')

  const u1 = users.children[0]
  verify(u1, 'LI', {
    className: 'user'
  }, 1, 'user 1')

  t.equal(u1.children[0].text, '@evan', 'user 1 text')

  const u2 = users.children[1]
  verify(u2, 'LI', {
    className: 'user'
  }, 1, 'user 2')

  t.equal(u2.children[0].text, '+evan2', 'user 2 text')

  const u3 = users.children[2]
  verify(u3, 'LI', {
    className: 'user'
  }, 1, 'user 3')

  t.equal(u3.children[0].text, '+fred', 'user 3 text')

  const u4 = users.children[3]
  verify(u4, 'LI', {
    className: 'user'
  }, 1, 'user 4')

  t.equal(u4.children[0].text, ' biscuits', 'user 4 text')

  t.end()
})
