'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')

module.exports = About

function About(target) {
  if (!(this instanceof About))
    return new About(target)

  Base.call(this, target)
}
inherits(About, Base)

About.prototype.close = function close(e) {
  e.preventDefault()
  this.target.router.goto('/connection')
}

About.prototype.render = function render() {
  const ab = this.target.about
  return h('#about', [
    h('.form.col-sm-12', [
      h('a.close', {
        innerHTML: '&times;'
      , onclick: (e) => {
          this.close(e)
        }
      })
    , h('img.img', {
        src: '../public/img/icon_512.png'
      })
    , h('h1.title', {
        key: 3
      }, `${ab.name} v${ab.version}`)
    , h('p.center', [
        h('a.external-url.repo', {
          href: ab.repo
        , key: 4
        }, ab.repo)
      ])
    ])
  ])
}
