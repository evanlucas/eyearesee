'use strict'
const linker = require('./linker')

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
    case 'notice':
      return `«${name}»`
    case 'join':
      return `⇾${name}`
    case 'part':
      return `⇽${name}`
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

exports.processMessage = function processMessage(msg, colorMap) {
  let m = exports.encode(msg)
  for (const item of colorMap.entries()) {
    const username = item[0]
    const color = item[1]
    const unRE = username
      .replace(/\|/g, '\\|')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
    const re = new RegExp(`\\b${unRE}\\b`, 'gi')
    m = m.replace(re, function(match, idx, str) {
      if (str[idx - 1] === '/' || str[idx + match.length] === '/') {
        return match
      }

      return `<span class="mention ${color || ''}">${match}</span>`
    })
  }

  return linker(m)
}
