'use strict'

const EE = require('events')
const inherits = require('util').inherits
const delegate = require('delegate-dom')
const parse = require('./lib/parse-message')
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')
const Channel = require('./lib/channel')
const linker = require('./lib/linker')
const debug = require('debug')('eyearesee:app')

module.exports = window.App = App

// views

const Server = require('./lib/elements/server')
const Sidebar = require('./lib/elements/sidebar')
const Login = require('./lib/elements/login')
const Input = require('./lib/elements/input')

function App(el, currentWindow) {
  if (!(this instanceof App))
    return new App(el, currentWindow)

  EE.call(this)
  this._notifications = 0

  this.el = el
  this.window = currentWindow
  this.db = require('./lib/db')
  this.auth = require('./lib/auth')()
  this.irc = null
  this._needsLogin = true
  this.nav = require('./lib/nav')(this)
  this.nav.setup()

  this.views = {
    server: new Server(this)
  , login: new Login(this)
  , input: new Input(this)
  , sidebar: new Sidebar(this)
  , channels: {}
  , messages: {}
  }

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

  var tree = this.render('login')
  var rootNode = createElement(tree)
  el.appendChild(rootNode)

  this.on('render', (view) => {
    var newTree = this.render(view)
    var patches = diff(tree, newTree)
    rootNode = patch(rootNode, patches)
    tree = newTree
    const active = this.nav.current
    if (active === '#server') {
      const ele = document.querySelector('.logs-container')
      ele.scrollTop = ele.scrollHeight
    } else if (this.data.channels[active]) {
      const ele = document.querySelector('.channel-container')
      ele.scrollTop = ele.scrollHeight
    }
  })

  this._logsEle = document.querySelector('.logs')

  this._checkAuth()
  this._addHandlers()
}
inherits(App, EE)

App.prototype.render = function render(type) {
  const views = this.views

  if (type === 'login') {
    return views.login.render()
  }

  var active = this.nav.current

  debug('render active %s', active)
  var view
  var columns = 2
  const data = this.data
  const channels = data.channels
  const messages = data.messages

  if (active === '#server') {
    view = views.server.render()
  } else if (channels[active] && views.channels[active]) {
    columns = 3
    channels[active].unread = 0
    view = views.channels[active].render(channels[active])
  } else if (messages[active] && views.messages[active]) {
    view = views.messages[active].render(messages[active])
  } else {
    view = views.server.render()
  }

  var container = [
    view
  , views.input.render()
  ]

  const main = columns === 2
    ? '#main2.pure-g'
    : '#main.pure-g'

  return h(main, [
    h('#sidebar.pure-u', [
      views.sidebar.render()
    ])
  , h('.container.pure-u-1', container)
  ])
}

App.prototype._addHandlers = function _addHandlers() {
  const sels = '#sidebar .nav-inner .pure-menu .pure-menu-list .pure-menu-item a'

  delegate.on(this.el, sels, 'click', (e) => {
    e.preventDefault()
    var a = e.target
    if (a)
      this.emit('nav', a)

    return false
  })

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
    switch (msg.type) {
      case '_message':
        if (active === '#server')
          return

        debug('sending "%s" "%s"', active, data)
        this.irc.send(active, data)
        const chans = this.data.channels
        var chan = chans[active]
        if (!chan) return
        chan.logs.push({
          from: this.data.user.nickname
        , message: data
        , ts: new Date()
        })
        this.emit('render')
        break
      case 'join':
        var name = data[0]
        debug('join %s', name)
        if (!name) return
        name = name.toLowerCase()
        var chan = new Channel({
          name: name
        })

        this.data.channels[name] = chan
        this.irc.join(name)
        break
      case 'leave':
      case 'part':
        const channel = data[0] || this.nav.current
        const m = data[1]
        if (!channel || channel === '#server') return

        debug('part %s %s', channel, m)

        if (!m)
          this.irc.part(channel)
        else
          this.irc.part(channel, m)
        break
    }
  })
}

App.prototype._checkAuth = function _checkAuth() {
  this.db.getUser((err, user) => {
    if (err) {
      if (err.notFound) {
        // show login
        this.showLogin()
        return
      }

      console.error(err.stack)
      return
    }

    this.data.user = user
    var pass = this.auth.getCreds(user.username)
    var u = Object.assign({
      password: pass
    }, user)

    this.db.getServer((err, server) => {
      if (err) {
        console.error(err.stack)
        return
      }
      this.data.server = server
      this.login(u)
    })
  })
}

App.prototype.saveAuth = function saveAuth(opts, cb) {
  // {
  //   username: ''
  // , realname: ''
  // , nickname: ''
  // , password: ''
  // , altusername: ''
  // , serverurl: ''
  // , port: ''
  // }
  const server = {
    host: opts.serverurl
  , port: opts.port
  }

  const user = {
    username: opts.username
  , realname: opts.realname
  , alt: opts.altusername
  , nickname: opts.nickname
  }

  const ops = [
    { type: 'put', key: 'server', value: server }
  , { type: 'put', key: 'user', value: user }
  ]

  this.db.batch(ops, (err) => {
    if (err) {
      console.error(err.stack)
      return cb && cb(err)
    }

    this.data.user = user
    this.data.server = server

    if (opts.password)
      this.auth.saveCreds(user.username, opts.password)
    cb && cb()
  })
}

App.prototype.login = function login(opts) {
  this.irc = require('./lib/irc')({
    server: this.data.server
  , user: opts
  })

  this.irc.on('connect', () => {
    this.emit('render')
    this.emit('nav', $('server'))
  })

  this.irc.on('notice', (msg) => {
    // from, to, hostmask, message

    const to = (msg.to || '').toLowerCase()
    const from = msg.from
    if (to[0] === '#') {
      // probably a channel
      const chan = this.data.channels[to]
      if (!chan) {
        debug('notice to what looks like a channel but doesnt exist', msg)
        return
      }

      chan.logs.push({
        type: 'notice'
      , from: from
      , message: msg.message
      , ts: new Date()
      })

      if (this.nav.current === to) {
        this.emit('render')
      }
    } else if (to) {
      // maybe a personal notice?
      // need to create a new window
    }
    this.log({
      type: 'notice'
    , message: msg.message
    , ts: new Date()
    })
  })

  this.irc.on('welcome', (msg) => {
    this.log({
      type: 'welcome'
    , message: msg
    , ts: new Date()
    })
  })

  this.irc.on('motd', (msg) => {
    this.log({
      type: 'motd'
    , message: msg.join('<br>')
    , ts: new Date()
    })
  })

  this.irc.on('topic', (msg) => {
    const name = msg.channel
    const topic = msg.topic
    this.log({
      type: 'topic'
    , message: topic
    , channel: name
    , ts: new Date()
    })
    debug('topic %s', name)
    const c = this.data.channels[name]
    if (!c) return
    c.topic = topic

    debug('channel topic %s %s', c.name, c.topic)
    this.emit('render')
  })

  this.irc.on('message', (msg) => {
    debug('irc message', msg)
    const to = msg.to
    const from = msg.from
    const chans = this.data.channels
    const msgs = this.data.messages

    if (chans[to]) {
      debug('channel exists...adding to logs and rendering')
      chans[to].logs.push({
        from: from
      , message: msg.message
      , ts: new Date()
      , type: 'message'
      })
      this.emit('render')
      if (msg.message.indexOf(this.data.user.nickname)) {
        this.setBadge()
        // TODO(evanlucas) Play sound or something?
      }
    } else if (to === this.data.user.nickname) {
      const message = msgs[from]
      if (message) {
        // the Message channel already exists
        // just update the log
        msgs[from].logs.push({
          from: from
        , message: msg.message
        , ts: new Date()
        , type: 'message'
        })
      } else {
        // the Message channel does not exist
        // it needs to be created along with the view

      }
    }

    if (this.nav.current !== to && chans[to]) {
      debug('adding badge for channel %s', to)
      chans[to].unread += 1
      this.emit('render')
    }
  })

  this.irc.on('ircerror', (msg) => {
    require('./lib/handlers/errors')(msg, this)
  })

  this.irc.on('errors', (msg) => {
    require('./lib/handlers/errors')(msg, this)
  })

  this.irc.on('names', (msg) => {
    require('./lib/handlers/names')(msg, this)
  })

  this.irc.on('part', (msg) => {
    require('./lib/handlers/part')(msg, this)
  })

  this.irc.on('quit', (msg) => {
    var nick = msg.prefix
    if (!nick) return
    nick = nick.split('!')[0]
    if (nick) {
      if (nick === this.data.user.nickname) {
        // it's me
        debug('I QUIT')
      } else {
        // find all the channels that the user is in
        // and remove them
        const chans = this.data.channels
        const names = Object.keys(chans)
        for (var i = 0, len = names.length; i < len; i++) {
          const chan = chans[names[i]]
          chan.removeUser(nick)
        }
      }
    }
  })

  this.irc.on('join', (msg) => {
    require('./lib/handlers/join')(msg, this)
  })
}

App.prototype.showLogin = function showLogin() {
  this.render('login')
}

App.prototype.showServer = function showServer() {
  const node = document.getElementById('server')
  debug('show server')
  this.nav.show('#server', node)
}

App.prototype.showChannel = function showChannel(name) {
  const node = document.querySelector(`a[href="${name}"]`)
  debug('show channel %s', name)
  this.nav.show(name.toLowerCase(), node)
}

App.prototype.log = function log(obj) {
  this.data.logs.push(obj)

  if (this.nav.current === '#server') {
    this.emit('render')
  }
}

function $(str) {
  return document.getElementById(str)
}
