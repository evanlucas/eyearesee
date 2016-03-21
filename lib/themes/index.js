'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const EE = require('events')
const Theme = require('./theme')
const debug = require('debug')('eyearesee:themes')

class Themes extends EE {
  constructor(app) {
    super()
    this.app = app
    this._dir = path.join(process.env.EYEARESEE_HOME, 'themes')
    this.res = path.join(process.env.EYEARESEE_RESOURCE_PATH)
    debug('themes directory %s', this._dir)
    this.settings = app.settings

    this.themes = new Map()
    this.styles = app.styles

    this.active = null

    this._setup()
    this.addDefault()
  }

  _setup() {
    try {
      mkdirp.sync(this._dir)
    } catch (err) {
      console.error('Cannot create themes dir', err)
    }
  }

  load(active, cb) {
    this.activate('dusk.css')
    fs.readdir(this._dir, (err, files) => {
      if (err) {
        console.error('unable to load themes directory %s', this._dir)
        return cb && cb(err)
      }

      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        if (path.extname(filename) !== '.css') continue

        const fp = path.join(this._dir, filename)
        const theme = new Theme(this, fp, filename, active === filename)
        debug('add theme %s', filename)
        if (active === filename) {
          this.active = theme
        }
        this.themes.set(filename, theme)
      }

      if (!this.active) {
        debug('no active theme, select default')
        this.active = this.themes.get('dusk.css')
      }

      if (this.themes.size === 1) {
        debug('only default theme exists, activate')
        this.activate('dusk.css')
      } else {
        debug('activating theme: %s', this.active.name)
        this.activate(this.active.name)
      }

      this.emit('loaded')

      cb && cb()
    })
  }

  addDefault() {
    const fp = path.join(this.res, 'public', 'css', 'dusk.css')
    const theme = new Theme(this, fp, 'dusk.css', true)
    this.active = theme
    this.themes.set('dusk.css', theme)
  }

  activate(name) {
    const active = this.active

    if (active) {
      active.active = false
      // TODO(evanlucas) remove the theme if it is not the default
      if (active.name !== 'dusk.css')
        this.styles.removeStyleSheet(active.file)
    }

    const theme = this.themes.get(name)
    if (!theme) {
      console.error('Cannot find theme', name)
      return
    }

    try {
      const contents = fs.readFileSync(theme.file, 'utf8')
      this.styles.addStyleSheet(contents, {
        sourcePath: theme.file
      })

      theme.active = true
      this.active = theme
      this.settings.set('theme.active', name, (err) => {
        if (err) {
          console.error('unable to set active theme', err)
        } else {
          debug('set theme.active to %s', name)
        }
      })
    } catch (err) {
      console.error('Could not load theme', err, theme)
      active.active = true
      this.styles.addStyleSheet(active.file)
      this.active = active
    }
  }
}

module.exports = Themes
