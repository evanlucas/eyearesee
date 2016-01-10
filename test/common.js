'use strict'

const tap = require('tap')

if (require.main === module) {
  tap.pass('ok')
  return
}

exports.VerifyNode = function VerifyNode(t) {
  return function(node, tagName, props, kids, type) {
    const ps = {}
    const keys = Object.keys(node.properties)
    const len = keys.length
    for (var i = 0; i < len; i++) {
      if (typeof node.properties[keys[i]] !== 'function') {
        ps[keys[i]] = node.properties[keys[i]]
      }
    }
    t.equal(node.tagName, tagName, `${type} tagName`)
    t.deepEqual(ps, props, `${type} properties`)
    t.equal(node.children.length, kids, `${type} children.length`)
  }
}
