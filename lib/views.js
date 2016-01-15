'use strict'

module.exports = function(app) {
  return {
    login: require('./views/login')(app)
  , sidebar: require('./views/sidebar')(app)
  , connection: require('./views/connection')(app)
  , input: require('./views/input')(app)
  , channel: require('./views/channel')(app)
  , connSettings: require('./views/connection-settings')(app)
  , serverbar: require('./views/serverbar')(app)
  }
}
