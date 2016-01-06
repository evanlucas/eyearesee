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
const ChannelView = require('./lib/elements/channel')

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
  const data = this.data
  const channels = data.channels
  const messages = data.messages

  if (type === 'login') {
    return views.login.render()
  }

  var active = this.nav.current

  debug('render active %s', active)
  var view
  var columns = 2
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
        const channel = data[0]
        const m = data[1]
        if (!channel) return

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
    this.log(`-NOTICE- ${msg.message}`)
  })

  this.irc.on('welcome', (msg) => {
    this.log(`-WELCOME- ${msg}`)
  })

  this.irc.on('motd', (msg) => {
    this.log(msg, '-MOTD- ')
  })

  this.irc.on('topic', (msg) => {
    const name = msg.channel
    const topic = msg.topic
    this.log(`-TOPIC- [${name}] ${topic}`)
    const c = this.data.channels[name]
    if (!c) return
    c.topic = topic

    debug('channel topic %s %s', c.name, c.topic)
    // once we get the topic, load all of the names
    this.irc.names(name, (err, names) => {
      if (err) {
        console.error('error getting names', err.stack)
        return
      }

      debug('emit nav %s', `channel-${name}`)
      this.emit('nav', $(`channel-${name}`))
    })
  })

  this.irc.on('message', (msg) => {
    debug('irc message', msg)
    const name = msg.to
    const chans = this.data.channels
    if (chans[name]) {
      debug('channel exists...adding to logs and rendering')
      chans[name].logs.push({
        from: msg.from
      , message: msg.message
      , ts: new Date()
      })
      this.emit('render')
      if (msg.message.indexOf(this.data.user.nickname)) {
        this.setBadge()
        // TODO(evanlucas) Play sound or something?
      }
    }

    if (this.nav.current !== name && chans[name]) {
      debug('adding badge for channel %s', name)
      chans[name].unread += 1
      this.emit('render')
    }
  })

  this.irc.on('names', (msg) => {
    const names = msg.names
    const channel = msg.channel
    const chan = this.data.channels[channel]
    if (!chan) return

    chan.setNames(names)
    this.emit('render')
  })

  this.irc.on('part', (msg) => {
    var nick = msg.prefix
    if (!nick) return
    nick = nick.split('!')[0]
    const channel = msg.params.toLowerCase()
    const chan = this.data.channels[channel]
    if (!chan) return

    if (nick) {
      if (nick === this.data.user.nickname) {
        // it's me
        debug('I PARTED FROM %s', channel)
      } else {
        chan.removeUser(nick)
      }
    }
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
    const channel = msg.channel
    const nick = msg.nick
    const chan = this.data.channels[channel]
    if (!chan) return

    if (nick === this.data.user.nickname) {
      // we just joined
      const view = new ChannelView(this.target)
      this.views.channels[channel] = view
    } else {
      // the second arg is the mode.
      // is there a way to get this from the message?
      chan.addUser(msg.nick, '')
      this.emit('render')
      debug('someone else joined %s %s', msg.nick, msg.channel)
    }
  })
}

App.prototype.showLogin = function showLogin() {
  this.render('login')
}

App.prototype.log = function log(msg, prefix) {
  if (Array.isArray(msg)) {
    for (var i = 0, len = msg.length; i < len; i++) {
      this.data.logs.push((prefix || '') + msg[i])
    }
  } else {
    this.data.logs.push(msg)
  }

  if (this.nav.current === '#server') {
    this.emit('render')
  }
}

function $(str) {
  return document.getElementById(str)
}
