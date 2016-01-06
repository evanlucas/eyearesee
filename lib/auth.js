'use strict'

const keytar = require('keytar')
const inherits = require('util').inherits
const EE = require('events')

const SERVICE = 'EyeAreSee (IRC Client)'

module.exports = Auth

function Auth() {
  if (!(this instanceof Auth))
    return new Auth()

  EE.call(this)
}
inherits(Auth, EE)

Auth.prototype.saveCreds = function saveCreds(username, password) {
  var pass = keytar.getPassword(SERVICE, username)
  if (pass) {
    keytar.replacePassword(SERVICE, username, password)
    pass = password
  } else {
    keytar.addPassword(SERVICE, username, password)
    pass = password
  }

  return {
    username: username
  , password: pass
  }
}

Auth.prototype.getCreds = function getCreds(username) {
  const pass = keytar.getPassword(SERVICE, username)
  return pass
}
