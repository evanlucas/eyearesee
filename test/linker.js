'use strict'

const test = require('tap').test
const linker = require('../lib/linker')

test('linker', (t) => {

  /* eslint-disable */
  const tests = [
    { i: 'Hello. I opened a PR at https://github.com/nodejs/node/pull/5967'
    , o: 'Hello. I opened a PR at <a href="https://github.com/nodejs/node/pull/5967" class="external-url external-url-url" target="_blank">nodejs/node#5967</a>'
    }
  , { i: 'Hello. Please go to #node.js'
    , o: 'Hello. Please go to #node.js'
    }
  , { i: 'https://github.com/evanlucas/eyearesee/commit/c76d957c967dfd35ee5b876f00bcda11662abba9'
    , o: '<a href="https://github.com/evanlucas/eyearesee/commit/c76d957c967dfd35ee5b876f00bcda11662abba9" class="external-url external-url-url" target="_blank">evanlucas/eyearesee@c76d957c</a>'
    }
  ]
  /* eslint-enable */

  tests.forEach((item) => {
    t.equal(linker(item.i), item.o, item.i)
  })
  t.end()
})
