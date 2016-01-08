'use strict'

const EE = require('events')
const inherits = require('util').inherits
const delegate = require('delegate-dom')
const parse = require('./lib/parse-message')
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')
const linker = require('./lib/linker')
const debug = require('debug')('eyearesee:app')
const auth = require('./lib/auth')
const utils = require('./lib/utils')

module.exports = window.App = App

const Connection = require('./lib/models/connection')
const Channel = require('./lib/models/channel')

function App(el, currentWindow) {
  if (!(this instanceof App))
    return new App(el, currentWindow)

  EE.call(this)
  this._notifications = 0

  this.el = el
  this.window = currentWindow
  this.db = require('./lib/db')
  this.nav = require('./lib/nav')(this)
  this.views = require('./lib/views')(this)

  this.data = {
    user: {
      username: ''
    , realname: ''
    , alt: ''
    , nickname: ''
    }
  , server: {
      host: ''
    , port: ''
    }
  , channels: {}
  , messages: {}
  , logs: []
  }

  this.connections = {}

  var tree = this.render('login')
  var rootNode = createElement(tree)
  el.appendChild(rootNode)

  this.on('render', (view) => {
    var newTree = this.render(view)
    var patches = diff(tree, newTree)
    rootNode = patch(rootNode, patches)
    tree = newTree
    const active = this.nav.current

    if (active) {
      const eleName = active.ele
      const ele = document.querySelector(eleName)
      if (ele) {
        ele.scrollTop = ele.scrollHeight
      }
    }
  })

  this._checkAuth()
  this._addHandlers()
}
inherits(App, EE)

App.prototype.render = function render() {
  const views = this.views

  if (!this.nav.current) {
    return views.login.render()
  }

  var view
  var columns = 2
  const data = this.data

  var active = this.nav.current

  if (active instanceof Connection) {
    view = views.connection.render(active)
  } else if (active instanceof Channel) {
    columns = 3
    active.unread = 0
    view = views.channel.render(active)
  }

  var container = [
    view
  , views.input.render(this.nav)
  ]

  const main = columns === 2
    ? '#main.col-2.pure-g'
    : '#main.col-3.pure-g'

  return h(main, [
    h('#sidebar.pure-u', [
      views.sidebar.render()
    ])
  , h('.container.pure-u-1', container)
  ])
}

App.prototype._addHandlers = function _addHandlers() {
  delegate.on(this.el, 'a.external-url', 'click', (e) => {
    e.preventDefault()
    var a = e.target
    if (a && a.href) {
      this.emit('openUrl', a.href)
    }

    return false
  })

  this.on('command', (msg) => {
    const data = msg.data
    const active = this.nav.current
    if (!active) return
    switch (msg.type) {
      case '_message':
        if (active instanceof Connection)
          return

        if (active instanceof Channel) {
          active.send(data)
          this.needsLayout()
        }
        break
      case 'join':
        if (!data[0]) return

        var conn
        if (active instanceof Connection) {
          conn = active
        } else if (active instanceof Channel) {
          conn = active._connection
        }

        if (conn) {
          const name = data[0]
          conn.join(name)
        } else {
          debug('invalid connection to join', active)
        }
        break
      case 'leave':
      case 'part':
        var conn
        if (active instanceof Connection) {
          conn = active
        } else if (active instanceof Channel) {
          conn = active._connection
        }

        if (conn) {
          conn.part(data[0], data[1])
        } else {
          debug('invalid connection to part', active)
        }
        break
    }
  })
}

App.prototype._checkAuth = function _checkAuth() {
  this.db.getConnections((err, connections) => {
    if (err) {
      if (err.notFound) {
        debug('cannot find any connections...show login')
        this.showLogin()
        return
      }

      console.error(err.stack)
      return
    }

    const len = connections.length

    if (!len) {
      debug('no saved connections...show login')
      this.showLogin()
      return
    }

    // we have saved connections
    debug('saved', connections)
    var active

    for (var i = 0; i < len; i++) {
      const opts = connections[i]
      const user = opts.user
      if (user.username) {
        opts.user.password = auth.getCreds(opts.name, user.username)
      }
      const conn = new Connection(opts, this)
      if (!active) {
        active = conn
      }
      this._addConnection(conn)
      if (conn.autoConnect) {
        conn.connect()
      }
    }

    if (active)
      this.nav.showConnection(active)
  })
}

App.prototype.login = function login(opts) {
  // create a new connection
  const conn = new Connection({
    name: opts.name || 'Freenode'
  , host: opts.host
  , port: opts.port
  , user: {
      username: opts.username
    , nickname: opts.nickname
    , realname: opts.realname
    , altnick: opts.altnick
    , password: opts.password
    }
  }, this)

  this._addConnection(conn)
  conn.persist((err) => {
    if (err) {
      console.error('persist error', err.stack)
    } else {
      debug('connection persisted')
    }
    conn.connect()
    this.nav.showConnection(conn)
  })
}

App.prototype.showLogin = function showLogin() {
  this.nav.showLogin()
}

App.prototype._addConnection = function _addConnection(conn) {
  this.connections[conn.name] = conn
  this.emit('render')
}

App.prototype.needsLayout = function needsLayout() {
  this.emit('render')
}

function $(str) {
  return document.getElementById(str)
}
