'use strict'

const keytar = require('keytar')

const SERVICE = 'EyeAreSee (IRC Client) '

const auth = exports

auth.saveCreds = function saveCreds(conn, username, password) {
  const service = `${SERVICE}- ${conn}`
  const pass = keytar.getPassword(service, username)
  if (pass) {
    keytar.replacePassword(service, username, password)
  } else {
    keytar.addPassword(service, username, password)
  }
}

auth.getCreds = function getCreds(conn, username) {
  const service = `${SERVICE}- ${conn}`
  const pass = keytar.getPassword(service, username)
  return pass
}
