'use strict'

const tap = require('tap')

if (require.main === module) {
  tap.pass('ok')
  return
}

exports.VerifyNode = function VerifyNode(t) {
  return function(node, tagName, props, kids, type) {
    t.equal(node.tagName, tagName, `${type} tagName`)
    t.deepEqual(node.properties, props, `${type} properties`)
    t.equal(node.children.length, kids, `${type} children.length`)
  }
}
