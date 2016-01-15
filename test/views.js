'use strict'

const test = require('tap').test
const Views = require('../lib/views')

test('views', (t) => {
  const app = {
    nav: {}
  }

  const views = Views(app)

  t.type(views.login, require('../lib/views/login'))
  t.type(views.login.render, 'function')

  t.type(views.sidebar, require('../lib/views/sidebar'))
  t.type(views.sidebar.render, 'function')

  t.type(views.connection, require('../lib/views/connection'))
  t.type(views.connection.render, 'function')

  t.type(views.input, require('../lib/views/input'))
  t.type(views.input.render, 'function')

  t.type(views.channel, require('../lib/views/channel'))
  t.type(views.channel.render, 'function')

  t.type(views.settings, require('../lib/views/connection-settings'))
  t.type(views.settings.render, 'function')

  t.type(views.serverbar, require('../lib/views/serverbar'))
  t.type(views.serverbar.render, 'function')

  t.end()
})
