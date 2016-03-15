'use strict'

const test = require('tap').test
const SidebarView = require('../../lib/views/sidebar')
const ConnectionView = require('../../lib/views/sidebar/connection')
const Connection = require('../../lib/models/connection')
const Channel = require('../../lib/models/channel')
const Settings = require('../../lib/models/connection-settings')
const LogoView = require('../../lib/views/logo')
const common = require('../common')

test('SidebarView with active connection', (t) => {
  t.plan(22)
  const conn = new Connection({
    name: 'Freenode'
  , user: {}
  })

  const app = {
    nav: {
      current: conn
    }
  , connections: new Map([['Freenode', conn]])
  }

  const verify = common.VerifyNode(t)

  const view = SidebarView(app)
  t.type(view.views, 'object')
  t.type(view.views.connection, ConnectionView)
  t.type(view.views.logo, LogoView)

  const v = view.render()

  verify(v, 'DIV', {
    className: 'nav-inner'
  }, 2, 'nav-inner')

  const logo = v.children[0]
  verify(logo, 'DIV', {
    id: 'logo'
  }, 2, 'logo')

  const eye = logo.children[0]
  verify(eye, 'I', {
    className: 'fa fa-eye fa-2x'
  }, 0, 'eye')

  const logoname = logo.children[1]
  verify(logoname, 'SPAN', {
    className: 'logoname'
  }, 1, 'logoname')

  const logotext = logoname.children[0]
  t.equal(logotext.text, 'EyeAreSee')

  const menu = v.children[1]
  verify(menu, 'DIV', {
    className: 'pure-menu'
  }, 1, 'pure-menu')

  const conn_ = menu.children[0]
  verify(conn_, 'DIV', {
    className: 'connection'
  }, 1, 'connection')
})

test('SidebarView with active connection settings', (t) => {
  t.plan(22)
  const conn = new Connection({
    name: 'Freenode'
  , user: {}
  })

  const app = {
    nav: {
      current: conn.settings
    }
  , connections: new Map([['Freenode', conn]])
  }

  const verify = common.VerifyNode(t)

  const view = SidebarView(app)
  t.type(view.views, 'object')
  t.type(view.views.connection, ConnectionView)
  t.type(view.views.logo, LogoView)

  const v = view.render()

  verify(v, 'DIV', {
    className: 'nav-inner'
  }, 2, 'nav-inner')

  const logo = v.children[0]
  verify(logo, 'DIV', {
    id: 'logo'
  }, 2, 'logo')

  const eye = logo.children[0]
  verify(eye, 'I', {
    className: 'fa fa-eye fa-2x'
  }, 0, 'eye')

  const logoname = logo.children[1]
  verify(logoname, 'SPAN', {
    className: 'logoname'
  }, 1, 'logoname')

  const logotext = logoname.children[0]
  t.equal(logotext.text, 'EyeAreSee')

  const menu = v.children[1]
  verify(menu, 'DIV', {
    className: 'pure-menu'
  }, 1, 'pure-menu')

  const conn_ = menu.children[0]
  verify(conn_, 'DIV', {
    className: 'connection'
  }, 1, 'connection')
})

test('SidebarView with active channel', (t) => {
  t.plan(22)
  const conn = new Connection({
    name: 'Freenode'
  , user: {}
  })

  const chan = new Channel({
    name: '#node.js'
  , connection: conn
  })

  const app = {
    nav: {
      current: chan
    }
  , connections: new Map([['Freenode', conn]])
  }

  const verify = common.VerifyNode(t)

  const view = SidebarView(app)
  t.type(view.views, 'object')
  t.type(view.views.connection, ConnectionView)
  t.type(view.views.logo, LogoView)

  const v = view.render()

  verify(v, 'DIV', {
    className: 'nav-inner'
  }, 2, 'nav-inner')

  const logo = v.children[0]
  verify(logo, 'DIV', {
    id: 'logo'
  }, 2, 'logo')

  const eye = logo.children[0]
  verify(eye, 'I', {
    className: 'fa fa-eye fa-2x'
  }, 0, 'eye')

  const logoname = logo.children[1]
  verify(logoname, 'SPAN', {
    className: 'logoname'
  }, 1, 'logoname')

  const logotext = logoname.children[0]
  t.equal(logotext.text, 'EyeAreSee')

  const menu = v.children[1]
  verify(menu, 'DIV', {
    className: 'pure-menu'
  }, 1, 'pure-menu')

  const conn_ = menu.children[0]
  verify(conn_, 'DIV', {
    className: 'connection'
  }, 1, 'connection')
})

test('SidebarView with no active does not throw', (t) => {
  const app = {
    nav: {
      current: null
    }
  , connections: new Map()
  }

  const view = SidebarView(app)
  t.type(view.views, 'object')
  t.type(view.views.connection, ConnectionView)
  t.type(view.views.logo, LogoView)

  const verify = common.VerifyNode(t)

  const v = view.render()
  verify(v, 'DIV', {
    className: 'nav-inner'
  }, 2, 'nav-inner')

  const logo = v.children[0]
  verify(logo, 'DIV', {
    id: 'logo'
  }, 2, 'logo')

  const eye = logo.children[0]
  verify(eye, 'I', {
    className: 'fa fa-eye fa-2x'
  }, 0, 'eye')

  const logoname = logo.children[1]
  verify(logoname, 'SPAN', {
    className: 'logoname'
  }, 1, 'logoname')

  const logotext = logoname.children[0]
  t.equal(logotext.text, 'EyeAreSee')

  const menu = v.children[1]
  verify(menu, 'DIV', {
    className: 'pure-menu'
  }, 0, 'pure-menu')

  t.end()
})
