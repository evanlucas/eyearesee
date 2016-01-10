'use strict'

const join = require('./join')
const msg = require('./msg')
const part = require('./part')
const mode = require('./mode')
const topic = require('./topic')
const names = require('./names')
const list = require('./list')
const invite = require('./invite')
const notice = require('./notice')
const who = require('./who')
const away = require('./away')
const whois = require('./whois')
const nick = require('./nick')

// aliases
const leave = part

module.exports = {
  join
, msg
, part
, leave
, mode
, topic
, names
, list
, invite
, notice
, who
, away
, whois
, nick
}
