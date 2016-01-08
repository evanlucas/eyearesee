'use strict'

const extend = require('util')._extend

exports.date = function date(input) {
  if (typeof input === 'number') {
    input = new Date(input)
  }

  const hours = exports.pad(input.getHours())
  const minutes = exports.pad(input.getMinutes())
  const seconds = exports.pad(input.getSeconds())

  return `${hours}:${minutes}:${seconds}`
}

exports.encode = function encode(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

exports.pad = function pad(n) {
  if (n < 10) return `0${n}`
  return `${n}`
}

exports.formatNameForType = function formatNameForType(name, type) {
  switch (type) {
    case 'action':
      return `● ${name}`
    case 'message':
    case 'mention':
      return `<${name}>`
    default:
      return `${name}`
  }
}

exports.encodeConnection = function encodeConnection(name) {
  name = name.toLowerCase()
  return `#server_____${name}`
}

exports.decodeConnection = function decodeConnection(str) {
  return str.replace('#server_____', '')
}

exports.namesMatching = function namesMatching(val, names) {
  const v = val.toLowerCase()
  const out = []
  const len = names.length
  for (var i = 0; i < len; i++) {
    const name = names[i].toLowerCase()
    if (name.indexOf(val) === 0)
      out.push(names[i])
  }

  return out
}

exports.flatten = function flatten(input) {
  const len = input.length
  if (!len) return []
  var output = []
  var current = null

  for (var i = 0; i < len; i++) {
    const item = input[i]
    if (!current) {
      current = {
        type: item.type
      , messages: [item.message]
      , channel: item.channel
      }
    } else {
      if (item.type !== 'topic') {
        if (current.type === item.type) {
          current.messages.push(item.message)
          continue
        }

        if ((i === len - 1) || current.type !== item.type) {
          output.push({
            type: current.type
          , messages: current.messages.slice()
          , channel: current.channel
          })
          current = {
            type: item.type
          , messages: [item.message]
          , channel: item.channel
          }
        }
      } else {
        // topic
        // create a new one for each topic as they are channel specific
        output.push({
          type: current.type
        , messages: current.messages.slice()
        , channel: current.channel
        })

        output.push({
          type: item.type
        , messages: [item.message]
        , channel: item.channel
        })
        current = null

        continue
      }
    }
  }

  if (current) {
    output.push(current)
  }

  return output
}
