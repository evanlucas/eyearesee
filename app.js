'use strict'

const EE = require('events')
const inherits = require('util').inherits
const delegate = require('delegate-dom')
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')
const debug = require('debug')('eyearesee:app')
const auth = require('./lib/auth')
const mapUtil = require('map-util')
const nextVal = mapUtil.nextVal
const prevVal = mapUtil.prevVal

module.exports = window.App = App

const Connection = require('./lib/models/connection')
const Channel = require('./lib/models/channel')
const ConnSettings = require('./lib/models/connection-settings')

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
  this.inputHandler = require('./lib/handle-input')(this)

  this.connections = new Map()

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

App.prototype.playMessageSound = function playMessageSound() {
  const ele = document.getElementById('messageSound')
  ele.play()
}

App.prototype.nextPanel = function nextPanel() {
  const active = this.nav.current
  if (!active) {
    return
  }

  if (active instanceof Connection) {
    // get the first channel
    // if it does not exist, get the first message
    // if it does not exist, get the next connection console
    if (active.channels.size) {
      const it = active.channels.values()
      return this.nav.showChannel(it.next().value)
    }

    if (active.privateMessages.size) {
      const it = active.privateMessages.values()
      return this.nav.showChannel(it.next().value)
    }

    if (this.connections.size > 1) {
      const n = nextVal(active, this.connections, true)
      if (n) {
        return this.nav.showConnection(n)
      }
    }

    // just re-render
    this.needsLayout()
  } else if (active instanceof Channel) {
    const conn = active._connection

    let n = nextVal(active, conn._panels)
    if (n) {
      return this.nav.showChannel(n)
    }

    if (this.connections.size > 1) {
      const n = nextVal(conn, this.connections, true)
      if (n) {
        return this.nav.showConnection(n)
      }

      this.needsLayout()
    } else {
      // show the channel
      this.nav.showConnection(conn)
    }
  }
}

App.prototype.previousPanel = function previousPanel() {
  const active = this.nav.current
  if (!active) {
    return
  }

  if (active instanceof Connection) {
    // get the previous connections last _panel value
    // if no panels, show the previous connection
    // if no previous connection, show the current one
    if (active._panels.size === 1) {
      // show the connection
      return this.nav.showConnection(active)
    }

    if (active._panels.size) {
      let item = null
      for (const thing of active._panels.values()) {
        item = thing
      }
      return this.nav.showChannel(item)
    }

    if (this.connections.size > 1) {
      const prevConn = prevVal(active, this.connections)
      if (prevConn) {
        return this.nav.showConnection(prevConn)
      }
    }

    // just re-render
    this.needsLayout()
  } else if (active instanceof Channel) {
    const conn = active._connection

    let n = prevVal(active, conn._panels)
    if (n) {
      return this.nav.showChannel(n)
    }

    // show the connection
    this.nav.showConnection(conn)
  }
}

App.prototype.render = function render() {
  const views = this.views

  if (!this.nav.current) {
    return views.login.render()
  }

  var view
  var columns = 2

  var active = this.nav.current

  if (active instanceof Connection) {
    view = views.connection.render(active)
  } else if (active instanceof Channel) {
    columns = 3
    active.unread = 0
    view = views.channel.render(active)
  } else if (active instanceof ConnSettings) {
    view = views.connSettings.render(active)
  }

  var container = [
    view
  , views.input.render(this.nav)
  ]

  const main = columns === 2
    ? '#main.col-2.pure-g'
    : '#main.col-3.pure-g'

  return h(main, [
    views.serverbar.render()
  , h('#sidebar.pure-u', [
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

  delegate.on(this.el, 'a.add-connection', 'mouseover', (e) => {
    const ele = document.querySelector('.tooltip.create')
    if (ele) {
      ele.classList.toggle('in')
    }
  })

  delegate.on(this.el, 'a.add-connection', 'mouseout', (e) => {
    const ele = document.querySelector('.tooltip.create')
    if (ele) {
      ele.classList.toggle('in')
    }
  })

  delegate.on(this.el, '#serverbar .menu a', 'mouseover', (e) => {
    const target = e.target
    const name = target.getAttribute('tooltipid')
    if (!name) return
    const ele = document.getElementById(name)
    if (ele) {
      ele.classList.toggle('in')
    }
  })

  delegate.on(this.el, '#serverbar .menu a', 'mouseout', (e) => {
    const target = e.target
    const name = target.getAttribute('tooltipid')
    if (!name) return
    const ele = document.getElementById(name)
    if (ele) {
      ele.classList.toggle('in')
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
  debug('add connection %s', conn.name.toLowerCase())
  this.connections.set(conn.name.toLowerCase(), conn)
  this.emit('render')
}

App.prototype.removeConnection = function removeConnection(conn) {
  debug('removeConnection %s', conn.name.toLowerCase(), this.connections.keys())
  this.connections.delete(conn.name.toLowerCase())
  this.emit('render')
}

App.prototype.renameConnection = function renameConnection(conn, prev) {
  this.connections.delete(prev.toLowerCase())
  this.connections.set(conn.name.toLowerCase(), conn)
}

App.prototype.needsLayout = function needsLayout() {
  this.emit('render')
}
