'use strict'

const EE = require('events')
const path = require('path')
const inherits = require('util').inherits
const delegate = require('delegate-dom')
const h = require('virtual-dom/h')
const diff = require('virtual-dom/diff')
const patch = require('virtual-dom/patch')
const createElement = require('virtual-dom/create-element')
const debug = require('debug')('eyearesee:app')
const CommandManager = require('./lib/commands')
const mapUtil = require('map-util')
const Tooltip = require('./lib/tooltip')
const Styles = require('./lib/styles/manager')
const Themes = require('./lib/themes')
const Router = require('./lib/router')
const Panels = require('./lib/panels')
const utils = require('./lib/utils')
const About = require('./lib/about')
const Logger = require('daily-file-writer')
const Notifications = require('./lib/notifications')

module.exports = window.App = App

const IRC = require('eyearesee-client')
const Connection = IRC.Connection
const Settings = IRC.Settings
const auth = IRC.auth

const defaultSettings = new Map([
  ['theme.active', 'dusk.css']
, ['invites.accept.auto', false]
, ['sounds.enabled', true]
, ['userbar.hidden', false]
, ['user.color', '#fb73fa']
, ['inline.images', false]
])

function App(el, currentWindow) {
  if (!(this instanceof App))
    return new App(el, currentWindow)

  EE.call(this)
  this._notifications = 0

  global.app = this

  this.el = el
  this.window = currentWindow
  this._isLoading = true
  this.db = require('./lib/db')
  this.settings = new Settings(defaultSettings)

  this.inputHandler = require('./lib/handle-input')(this)
  this.commandManager = new CommandManager()
  this.styles = new Styles()
  this.themes = new Themes(this)
  this.panels = new Panels(this)
  this.about = new About()
  this.notifications = new Notifications(this)

  this.loggers = new Map()

  this.activeModel = null

  this._addCommands()

  this.views = require('./lib/views')(this)
  this._views = new WeakMap()

  this.connections = new Map()
  this.tooltips = new Map()
  this.router = new Router(this)
  this.url = '/'

  this._addRoutes()
  this._addStyles()
  this._addHandlers()
  this._addWindowHandlers()

  this.once('loaded', () => {
    const v = document.querySelector('irc-loading-view')
    if (v) {
      document.body.removeChild(v)
    }

    var tree = this._renderInside(this.views.login.render(), 2)
    var rootNode = createElement(tree)
    el.appendChild(rootNode)

    this.on('render', (view) => {
      var newTree = view
      if (!newTree) return
      const patches = diff(tree, newTree)
      rootNode = patch(rootNode, patches)
      tree = newTree

      if (this.activeModel) {
        if (this.activeModel.ele) {
          const ele = document.querySelector(this.activeModel.ele)
          if (ele) {
            // TODO(evanlucas) Fix this so it auto scrolls only
            // if we are not already scrolling
            //
            // if (ele.scrollHeight - ele.clientHeight <= ele.scrollTop + 1) {
            //   ele.scrollTop = ele.scrollHeight
            // }
            ele.scrollTop = ele.scrollHeight
          }
        } else if (this.activeModel instanceof Settings) {
          const ele = document.querySelector('.settings-container')
          if (ele) {
            ele.scrollTop = 0
          }
        }
      }

      if (this.views.input.commandBar.isShowing()) {
        const item = document.querySelector('.command.active')
        if (item) {
          item.scrollIntoViewIfNeeded(false)
        }
      }
    })
  })
  this.load()
}
inherits(App, EE)

App.prototype._addWindowHandlers = function _addWindowHandlers() {
  this.window.on('focus', () => {
    if (this.activeModel && this.activeModel.unread) {
      // clear the sidebar badges for this channel
      const before = this.activeModel.unread
      this.activeModel.unread = 0
      // decrement the badge count by _before_
      this.decrementBadgeCount(before)
      this.needsLayout()
    }
  })
}

App.prototype._addCommands = function _addCommands() {
  this.commandManager.addDefaults()
}

App.prototype._addStyles = function _addStyles() {
  const ele = this.styles.buildElement()
  document.head.appendChild(ele)
}

App.prototype.isActive = function isActive(item) {
  return this.url === item.url
}

App.prototype.decrementBadgeCount = function decrementBadgeCount(n) {
  const diff = this._notifications - n
  if (diff > 0) {
    this.setBadge(diff)
  } else if (diff === 0) {
    this.setBadge(false)
  }
}

App.prototype._clearViewBadge = function _clearViewBadge(model) {
  if (!model) return
  const unread = model.unread
  if (unread) {
    model.unread = 0
    this.decrementBadgeCount(unread)
  }
}

App.prototype._addRoutes = function _addRoutes() {
  const views = this.views
  this.router.add('/login', () => {
    this.activeModel = null
    this.renderInside(views.login.render(), 2)
  })

  this.router.add('/about', () => {
    this.activeModel = this.about
    this.renderOutside(views.about.render())
  })

  this.router.add('/settings', () => {
    this.activeModel = this.settings
    this.renderInside(views.settings.render(), 2)
  })

  this.router.add('/connection', () => {
    const conn = mapUtil.firstVal(this.connections)
    if (conn) {
      this.router.goto(conn.url)
    }
  })

  this.router.add('/connections/:name', (params) => {
    const conn = this.connections.get(params.name.toLowerCase())
    if (!conn) {
      debug('404...cannot find connection %s', params.name)
      return
    }

    this.activeModel = conn

    this.renderInside([
      views.connection.render(conn)
    , views.input.render()
    ], 2)
  })

  this.router.add('/connections/:name/settings', (params) => {
    const conn = this.connections.get(params.name.toLowerCase())
    if (!conn) {
      debug('404...cannot find connection %s', params.name)
      return
    }

    this.activeModel = conn.settings

    this.renderInside([
      views.connSettings.render(conn.settings)
    , views.input.render()
    ], 2)
  })

  this.router.add('/connections/:name/channels/:channelName', (params) => {
    const conn = this.connections.get(params.name.toLowerCase())
    if (!conn) {
      debug('404...cannot find connection %s', params.name)
      return
    }

    const name = params.channelName.toLowerCase()

    let chan = conn.channels.get(name)
    if (!chan) {
      chan = conn.queries.get(name)
      if (!chan) {
        debug('404...cannot find channel %s %s', conn.name, name)
        return
      }
    }

    const cols = this.settings.get('userbar.hidden')
      ? 2
      : 3

    this._clearViewBadge(chan)

    this.activeModel = chan

    this.renderInside([
      views.channel.render(chan)
    , views.input.render()
    ], cols)
  })
}

App.prototype.renderOutside = function renderOutside(args) {
  this.emit('render', args)
}

App.prototype.renderInside = function renderInside(args, cols) {
  this.emit('render', this._renderInside(args, cols))
}

App.prototype._renderInside = function _renderInside(args, cols) {
  cols = cols || 2
  const views = this.views

  if (!Array.isArray(args)) args = [args]

  return h(`irc-workspace.col-${cols}.pure-g`, [
    h('irc-notification.hide', [
      h('p', '')
    ])
  , views.serverbar.render()
  , h('irc-sidebar.pure-u', [
      views.sidebar.render()
    ])
  , h('.container.pure-u-1', args)
  ])
}

App.prototype._addHandlers = function _addHandlers() {
  delegate.on(this.el, 'a.external-url, a.external-url img', 'click', (e) => {
    e.preventDefault()
    var a = e.target
    if (a && a.href) {
      this.emit('openUrl', a.href)
    } else {
      if (a.tagName === 'IMG') {
        this.emit('openUrl', a.parentNode.href)
      }
    }

    return false
  })

  delegate.on(this.el, 'a.internal-url', 'click', (e) => {
    e.preventDefault()
    const a = e.target
    if (a && a.href) {
      const u = a.href.replace('file://', '')
      this.router.goto(u)
    }

    return false
  })

  const addConnTooltip = new Tooltip(this.el, {
    selector: 'a.add-connection'
  , placement: 'right'
  , container: 'body'
  , viewportPadding: 2
  , title: 'Create Connection'
  , delay: null
  })

  this.newConnectionTip = addConnTooltip

  this.settings.on('settingChanged', (key, orig, val) => {
    // TODO(evanlucas) if key is user.color, maybe go through
    // and call the messageFormatter on all messages?
    // Not sure if it is worth it to keep the color in sync for previous
    // messages though
    this.db.settings.put(key, val, (err) => {
      if (err) {
        console.error('Unable to persist setting changed', key, val, err)
      } else {
        debug('persisted %s from %j => %j', key, orig, val)
      }
    })
  })
}

App.prototype.load = function load() {
  this._loadSettings((err) => {
    if (err) {
      console.error('settings load error', err)
      return
    }

    const active = this.settings.get('theme.active')
    this.themes.load(active, () => {
      this.emit('loaded')
      this._checkAuth()
    })
  })
}

App.prototype.persistConn = function persistConn(conn, cb) {
  this.checkConnLogging(conn)
  this.db.persistConnection(conn.toJSON(), cb)
}

App.prototype.login = function login(opts) {
  const conn = new Connection({
    name: opts.name
  , server: {
      host: opts.host
    , port: opts.port
    }
  , user: {
      username: opts.username
    , nickname: opts.nickname
    , realname: opts.realname
    , altNick: opts.altnick
    , password: opts.password
    }
  , settings: {
      'connect.auto': true
    , 'persist.password': true
    }
  }, this)

  this._addConnection(conn)
  this.persistConn(conn, (err) => {
    if (err) {
      console.error('persist error', err)
    }

    this.router.goto(conn.url)
  })
}

App.prototype._loadSettings = function _loadSettings(cb) {
  const data = {}
  var called = false

  const done = (err) => {
    if (called) return
    called = true
    this.settings.load(data)
    cb(err)
  }

  this.db.settings.createReadStream()
    .on('data', (item) => {
      const o = {}
      o[item.key] = item.value

      Object.assign(data, o)
    })
    .on('error', done)
    .on('close', done)

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
      this.router.goto('/login')
      return
    }

    // we have saved connections
    var active
    const settings = this.settings
    for (var i = 0; i < len; i++) {
      const opts = connections[i]
      const user = opts.user
      if (user.username && !user.password) {
        debug('PASS', auth.getCreds(opts.name, user.username))
        opts.user.password = auth.getCreds(opts.name, user.username)
      }

      opts.messageFormatter = function messageFormatter(msg) {
        if (msg.type === 'join' || msg.type === 'part') {
          return utils.encode(msg.message)
        }

        const chan = msg.channel || {}
        const m = msg.message
        return utils.processMessage(m, chan.colorMap, chan.conn, settings)
      }

      const conn = new Connection(opts, this)
      if (!active) {
        active = conn
      }
      this._addConnection(conn)
      this.checkConnLogging(conn)
    }

    this._isLoading = false

    if (active)
      this.router.goto(active.url)
  })
}

App.prototype._addConnection = function _addConnection(conn) {
  debug('add connection %s', conn.name.toLowerCase())
  const key = conn.name.toLowerCase()
  this.connections.set(key, conn)
  const addConnTooltip = new Tooltip(this.el, {
    selector: `irc-serverbar a[navtype=connection][navname="${conn.name}"]`
  , placement: 'right'
  , container: 'body'
  , viewportPadding: 2
  , title: conn.name
  , delay: null
  })
  this.tooltips.set(key, addConnTooltip)
  const evs = [ 'channelUpdated'
              , 'whois'
              ]

  evs.forEach((ev) => {
    conn.on(ev, () => {
      this.needsLayout()
    })
  })

  conn.on('log', (msg) => {
    this.needsLayout()
    const logger = this.loggers.get(conn)
    if (logger) {
      const d = new Date(msg.ts)
      if (msg.from) {
        logger.write(`[${d.toISOString()}] ${msg.from}: ${msg.message}`)
      } else {
        logger.write(`[${d.toISOString()}] ${msg.message}`)
      }
    }
  })

  conn.on('channelLog', (chan, msg) => {
    // all mentions should get a sound, a bubble, and a dock icon
    // if it is a query and it is to me, get sound, a bubble, and dock icon
    // if the window is focused, don't add dock badge
    if (msg.mention || msg.to === chan.nick) {
      if (this.settings.get('sounds.enabled')) {
        this.notifications.playSound('message')
      }
      if (!this.window.isFocused()) {
        this.setBadge()
      }
    }

    const logger = this.loggers.get(chan)
    if (logger) {
      const d = new Date(msg.ts)
      if (msg.from) {
        logger.write(`[${d.toISOString()}] ${msg.from}: ${msg.message}`)
      } else {
        logger.write(`[${d.toISOString()}] ${msg.message}`)
      }
    }
  })

  const persistEvents = [
    'channelAdded'
  , 'channelRemoved'
  , 'queryAdded'
  , 'queryRemoved'
  ]

  persistEvents.forEach((ev) => {
    conn.on(ev, (chan) => {
      this.needsLayout()
      this.persistConn(conn, (err) => {
        if (err) {
          debug('failed to persist connection %s', conn.name, err)
        } else {
          debug('connection persisted %s', conn.name)
        }
      })
    })
  })

  this.router.goto(conn.url)

  conn.settings.on('settingChanged', (key, orig, val) => {
    this.persistConn(conn, (err) => {
      if (err) {
        console.error('cannot persist conn setting', key, orig, val)
      } else {
        debug('persisted connection setting %s %j => %j', key, orig, val)
      }
    })
  })
}

App.prototype.checkConnLogging = function checkConnLogging(conn) {
  debug('checkConnLogging %s', conn.name)
  const enabled = conn.settings.get('transcripts.enabled')
  const logger = this.loggers.get(conn)
  if (enabled && !logger) {
    debug('logging enabled, no logger...creating')
    const fp = utils.connectionLogLocation(conn)
    if (fp) {
      debug('%s logging to %s', conn.name, fp)
      const l = new Logger({
        path: fp
      })
      l.open()
      this.loggers.set(conn, l)
    }
  } else if (!enabled && logger) {
    debug('logger not enabled, but exists...closing')
    logger.close()
    this.loggers.delete(conn)
  } else if (enabled && logger) {
    const fp = utils.connectionLogLocation(conn)
    if (path.dirname(logger.fp) !== fp) {
      debug('logger enabled and exists, diff path %s %s', fp)
      logger.close()
    }

    if (fp) {
      const l = new Logger({
        path: fp
      })
      l.open()
      this.loggers.set(conn, l)
    }
  }

  // Now, make sure all of the children are correct
  for (const chan of conn._panels.values()) {
    this.checkChannelLogging(chan)
  }
}

App.prototype.checkChannelLogging = function checkChannelLogging(chan) {
  debug('check channel logging %s', chan.name)
  const enabled = chan.getConnection().settings.get('transcripts.enabled')
  const logger = this.loggers.get(chan)
  if (enabled && !logger) {
    debug('enabled, no logger')
    const fp = utils.channelLogLocation(chan)
    debug('create logger %s %s', chan.name, fp)
    if (fp) {
      const l = new Logger({
        path: fp
      })
      l.open()
      this.loggers.set(chan, l)
    }
  } else if (!enabled && logger) {
    logger.close()
    this.loggers.delete(chan)
  } else if (enabled && logger) {
    // check that the path is the same, otherwise, close and reopen
    const fp = utils.channelLogLocation(chan)
    if (path.dirname(logger.fp) !== fp) {
      logger.close()
    }

    if (fp) {
      const l = new Logger({
        path: fp
      })
      l.open()
      this.loggers.set(chan, l)
    }
  }
}

App.prototype.removeConnection = function removeConnection(conn) {
  const key = conn.name.toLowerCase()
  debug('removeConnection %s', key, this.connections.keys())
  this.connections.delete(key)
  this.tooltips.get(key).destroy()
  this.tooltips.delete(key)
  this.checkConnLogging(conn)

  if (this.connections.size) {
    this.router.goto('/connection')
  } else {
    this.router.goto('/login')
  }
}

App.prototype.renameConnection = function renameConnection(conn, prev) {
  this.removeConnection(prev)
  this._addConnection(conn)
}

App.prototype.needsLayout = function needsLayout() {
  this.router.goto(this.url)
}

App.prototype.getActiveConnection = function getActiveConnection() {
  if (this.activeModel) {
    if (this.activeModel.getConnection) {
      return this.activeModel.getConnection()
    }
  }

  return null
}
