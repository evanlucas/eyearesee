'use strict'

const keytar = require('keytar')
const inherits = require('util').inherits
const EE = require('events')

const SERVICE = 'EyeAreSee (IRC Client) '

module.exports = new Auth()

function Auth() {
  if (!(this instanceof Auth))
    return new Auth()

  EE.call(this)
}
inherits(Auth, EE)

Auth.prototype.saveCreds = function saveCreds(conn, username, password) {
  const service = `${SERVICE}- ${conn}`
  var pass = keytar.getPassword(service, username)
  if (pass) {
    keytar.replacePassword(service, username, password)
    pass = password
  } else {
    keytar.addPassword(service, username, password)
    pass = password
  }
}

Auth.prototype.getCreds = function getCreds(conn, username) {
  const service = `${SERVICE}- ${conn}`
  const pass = keytar.getPassword(service, username)
  return pass
}
