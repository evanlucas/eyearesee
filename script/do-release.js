#!/usr/bin/env node

'use strict'

const semver = require('semver')
const utils = require('../lib/utils')
const exec = require('child_process').execSync
const path = require('path')
const fs = require('fs')
const args = process.argv.splice(2)
const pkg = require('../package')
const pkgPath = path.join(__dirname, '..', 'package.json')
const chalk = require('chalk')

const changelogFP = path.join(__dirname, '..', 'CHANGELOG.md')

if (!args.length) {
  const s = './script/do-release.js'
  console.error(`usage: ${s} <version> --dry-run`)
  console.error('or')
  console.error(`usage: ${s} <patch|minor|major> --dry-run`)
  process.exit(1)
}

const dry = !!~args.indexOf('--dry-run')

function info() {
  console.log(chalk.gray.apply(null, arguments))
}

function error() {
  console.error(chalk.red.apply(null, arguments))
}

if (dry) {
  info('---------------------------------------------------------')
  info('-------------------------DRY RUN-------------------------')
  info('---------------------------------------------------------')
  console.log()
}

function getDate() {
  const d = new Date()
  const year = d.getFullYear()
  const month = utils.pad(d.getMonth() + 1)
  const day = utils.pad(d.getDate())
  return `${year}-${month}-${day}`
}

function getUser() {
  try {
    return exec('git config user.name').toString().trim()
  } catch (err) {
    return '@evanlucas'
  }
}

const currentVersion = pkg.version
const numbers = ['major', 'minor', 'patch']

const cmd = args.shift()
let version
if (~numbers.indexOf(cmd)) {
  version = semver.inc(currentVersion, cmd)
} else {
  version = cmd
}

if (!semver.valid(version)) {
  error('Version is not valid %s', version)
  process.exit(1)
}

version = version.replace('v', '')

const commitTitle = `${getDate()} Version ${version} (Stable) Release`

const cl = exec('changelog-maker --group --filter-release').toString()

const clContents = fs.readFileSync(changelogFP, 'utf8').split('\n')

const title = clContents.shift()

clContents.unshift(cl.trim())
clContents.unshift('')
const releaseTitle = `# ${getDate()} v${version} Release, ${getUser()}`
clContents.unshift(releaseTitle)
clContents.unshift('')
clContents.unshift(title)

if (dry) {
  info('   Prepending the following to the changelog:\n')
  debug('      ', releaseTitle)
  debug('')
  cl.split('\n').forEach((item) => {
    debug('      ', item)
  })

  console.log()
  info('   Bump package.json version')
  info(`     from: ${chalk.yellow(pkg.version)}`)
  info(`     to:   ${chalk.magenta(version)}`)
  console.log()

  dryExec('git add package.json')
  dryExec('git add CHANGELOG.md')
  dryExec(`git commit -m '${commitTitle}'`)

  const sha = 'aaaaaaaa'

  dryExec(`git tag v${version} ${sha} -sm '${commitTitle}'`)
} else {
  info('   Prepending the following to the changelog:\n')
  debug('      ', releaseTitle)
  debug('')
  cl.split('\n').forEach((item) => {
    debug('      ', item)
  })

  fs.writeFileSync(changelogFP, clContents.join('\n'), 'utf8')

  console.log()
  info('   Bump package.json version')
  info(`     from: ${chalk.yellow(pkg.version)}`)
  info(`     to:   ${chalk.magenta(version)}`)
  console.log()

  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')


  realExec('git add package.json')
  realExec('git add CHANGELOG.md')
  const res = realExec(`git commit -m '${commitTitle}'`).toString()
  const matches = res.match(/\[master ([^\]]+)\]/m)
  if (!matches || !matches[1]) {
    error('Unable to find commit sha in', res)
    return rollback()
  }

  const sha = matches[1]

  const c = `git tag v${version} ${sha} -sm '${commitTitle}'`
  try {
    info('signing commit', sha)
    realExec(c).toString()
  } catch (err) {
    error('failed to sign commit', err.message)
    return rollback()
  }

  console.log(chalk.green('SUCCESS', chalk.magenta(`v${version}`)))
}

function rollback() {
  info('rolling back commit...')
  info(realExec('git undo && git stash').toString())
  process.exit(1)
}

function dryExec(cmd) {
  console.log(chalk.gray('   >', cmd))
  console.log()
}

function realExec(cmd) {
  dryExec(cmd)
  return exec(cmd)
}

function debug() {
  console.log(chalk.cyan.apply(null, arguments))
}
