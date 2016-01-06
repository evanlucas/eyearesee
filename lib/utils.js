'use strict'

exports.date = function date(input) {
  if (typeof input === 'number') {
    input = new Date(input)
  }

  const hours = input.getHours()
  const minutes = input.getMinutes()
  let seconds = input.getSeconds()
  if (seconds < 10) {
    seconds = `0${seconds}`
  }

  return `${hours}:${minutes}:${seconds}`
}

exports.encode = function encode(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
