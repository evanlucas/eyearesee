#!/usr/bin/env node

'use strict'

const semver = require('semver')
const utils = require('../lib/utils')
const args = process.argv.splice(2)

if (!args.length) {
  const s = './script/release-commit-title.js'
  console.error(`usage: ${s} <version>`)
  console.error('or')
  console.error(`usage: ${s} <patch|minor|major>`)
  process.exit(1)
}

function getDate() {
  const d = new Date()
  const year = d.getFullYear()
  const month = utils.pad(d.getMonth() + 1)
  const day = utils.pad(d.getDate())
  return `${year}-${month}-${day}`
}

const currentVersion = require('../package').version
const numbers = ['major', 'minor', 'patch']

const cmd = args.shift()
let version
if (~numbers.indexOf(cmd)) {
  version = semver.inc(currentVersion, cmd)
} else {
  version = cmd
}

if (!semver.valid(version)) {
  console.error('Version is not valid %s', version)
  process.exit(1)
}

version = version.replace('v', '')

console.log(`${getDate()} Version ${version} Release (Stable)`)
