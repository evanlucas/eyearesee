'use strict'
const linker = require('./linker')
const path = require('path')

exports.connectionLogLocation = function connectionLogLocation(conn) {
  if (conn.settings.get('transcripts.enabled')) {
    const loc = conn.settings.get('transcripts.location')
    if (loc) {
      return path.join(loc, 'Connections', conn.name, 'Console')
    }
  }

  return null
}

exports.channelLogLocation = function channelLogLocation(chan) {
  const conn = chan.getConnection()
  const t = chan.type === 'channel'
    ? 'Channels'
    : 'Messages'

  const connLog = exports.connectionLogLocation(conn)
  if (!connLog) return null
  return path.join(connLog, '..', t, chan.name)
}

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

const channelPrefixs = [
  '#'
, '&'
, '!'
]

exports.isValidChannel = function isValidChannel(name) {
  if (!name) return false
  if (~channelPrefixs.indexOf(name[0])) return true
  return false
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
      return `⇾ ${name}`
    case 'part':
      return `⇽ ${name}`
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

exports.processMessage = function processMessage(msg, colorMap, conn, uc) {
  let m = exports.encode(msg)
  // This sucks :/
  m = m.replace('\u0002', '<strong>').replace('\u0002', '</strong>')
  for (const item of colorMap.entries()) {
    const username = item[0]
    const color = conn && uc && username === conn.nick
      ? uc
      : item[1]

    let mycol
    if (conn && uc && username === conn.nick) {
      mycol = uc
    }

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

      if (mycol) {
        return `<span class="mention" style="color: ${mycol};">${match}</span>`
      }

      return `<span class="mention ${color || ''}">${match}</span>`
    })
  }

  if (conn) {
    const chans = Array.from(conn.channels.keys())
    m = m.replace(/#([^\s]+)/g, (match, idx, str) => {
      if (!~chans.indexOf(match)) return match
      const url = `/connections/${conn.name}/channels/${match}`
      return `<a href="${url}" class="internal-url">${match}</a>`
    })
  }

  return linker(m)
}
