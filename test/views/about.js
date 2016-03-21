'use strict'

const test = require('tap').test
const About = require('../../lib/views/about')
const common = require('../common')

test('AboutView', (t) => {
  t.plan(25)
  const app = {
    showConnection: () => {
      t.pass('called showConnection')
    }
  , about: {
      name: 'eyearesee'
    , version: '1.0.0'
    , repo: 'https://github.com/evanlucas/eyearesee'
    }
  }

  const verify = common.VerifyNode(t)

  const about = new About(app)
  const res = about.render()

  verify(res, 'DIV', {
    id: 'about'
  }, 1, 'about')

  const form = res.children[0]
  verify(form, 'DIV', {
    className: 'form col-sm-12'
  }, 4, 'form')

  const closeBtn = form.children[0]
  verify(closeBtn, 'A', {
    innerHTML: '&times;'
  , className: 'close'
  }, 0, 'close button')

  const img = form.children[1]
  verify(img, 'IMG', {
    src: '../public/img/icon_512.png'
  , className: 'img'
  }, 0, 'logo')

  const title = form.children[2]
  verify(title, 'H1', {
    key: undefined
  , className: 'title'
  }, 1, 'title')

  const titleText = title.children[0]
  t.equal(titleText.text, 'eyearesee v1.0.0', 'title text')

  const p = form.children[3]
  verify(p, 'P', { className: 'center' }, 1, 'p.center')

  const a = p.children[0]
  verify(a, 'A', {
    href: 'https://github.com/evanlucas/eyearesee'
  , key: undefined
  , className: 'external-url repo'
  }, 1, 'url')

  const url = a.children[0]
  t.equal(url.text, 'https://github.com/evanlucas/eyearesee', 'url text')

  const obj = {
    preventDefault: () => {
      t.pass('called preventDefault')
    }
  }

  closeBtn.properties.onclick(obj)
})
