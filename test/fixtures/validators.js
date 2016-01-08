module.exports = {
  join: [
    { input: '/join #foobar'
    , output: { type: 'join', channels: ['#foobar'], keys: [] }
    }
  , { input: '/join #foo,#bar fubar,foobar'
    , output: {
        type: 'join', channels: ['#foo', '#bar'], keys: ['fubar', 'foobar']
      }
    }
  , { input: '/join #foo,#bar'
    , output: { type: 'join', channels: ['#foo', '#bar'], keys: [] }
    }
  , { input: '/join 0'
    , output: { type: 'join', channels: ['0'], keys: [] }
    }
  , { input: '/join #foo,&bar fubar'
    , output: { type: 'join', channels: ['#foo', '&bar'], keys: ['fubar'] }
    }
  , { input: '/join &foo fubar'
    , output: { type: 'join', channels: ['&foo'], keys: ['fubar'] }
    }
  , { input: '/join', output: null }
  ]
, part: [
    { input: '/part', output: null }
  , { input: '/part #node.js'
    , output: { type: 'part', channels: ['#node.js'], message: '' }
    }
  , { input: '/part #Node.js,#node-dev'
    , output: {
        type: 'part', channels: ['#node.js', '#node-dev'], message: ''
      }
    }
  , { input: '/part #node.js Goodbye for now'
    , output: {
        type: 'part', channels: ['#node.js'], message: 'Goodbye for now'
      }
    }
  ]
, mode: [
    { input: '/mode', output: null }
  , { input: '/mode #node.js', output: null }
  , { input: '/mode #Finnish +imI *!*@*.fi'
    , output: {
        type: 'mode'
      , target: '#finnish'
      , flags: '+imI'
      , params: '*!*@*.fi'
      }
    }
  , { input: '/mode #Finnish +o Kilroy'
    , output: {
        type: 'mode'
      , target: '#finnish'
      , flags: '+o'
      , params: 'Kilroy'
      }
    }
  , { input: '/mode #Finnish +v Wiz'
    , output: {
        type: 'mode'
      , target: '#finnish'
      , flags: '+v'
      , params: 'Wiz'
      }
    }
  , { input: '/mode #Fins -s'
    , output: {
        type: 'mode'
      , target: '#fins'
      , flags: '-s'
      , params: ''
      }
    }
  , { input: '/mode #42 +k oulu'
    , output: {
        type: 'mode'
      , target: '#42'
      , flags: '+k'
      , params: 'oulu'
      }
    }
  , { input: '/mode #42 -k oulu'
    , output: {
        type: 'mode'
      , target: '#42'
      , flags: '-k'
      , params: 'oulu'
      }
    }
  , { input: '/mode #eu-opers +l 10'
    , output: {
        type: 'mode'
      , target: '#eu-opers'
      , flags: '+l'
      , params: '10'
      }
    }
  ]
, topic: [
    { input: '/topic', output: null }
  , { input: '/topic #test'
    , output: { type: 'topic', channel: '#test', topic: null }
    }
  , { input: '/topic #Test :another topic'
    , output: { type: 'topic', channel: '#test', topic: 'another topic' }
    }
  , { input: '/topic #test :'
    , output: { type: 'topic', channel: '#test', topic: '' }
    }
  ]
, names: [
    { input: '/names', output: { type: 'names', channels: [] } }
  , { input: '/names #Node.js'
    , output: { type: 'names', channels: ['#node.js'] }
    }
  , { input: '/names #node.js,#node-dev'
    , output: { type: 'names', channels: ['#node.js', '#node-dev'] }
    }
  ]
, list: [
    { input: '/list', output: { type: 'list', channels: [], server: null } }
  , { input: '/list #Node.js'
    , output: {
        type: 'list'
      , channels: ['#node.js']
      , server: null
      }
    }
  , { input: '/list #node.js chat.freenode.net'
    , output: {
        type: 'list'
      , channels: ['#node.js']
      , server: 'chat.freenode.net'
      }
    }
  ]
, invite: [
    { input: '/invite', output: null }
  , { input: '/invite a', output: null }
  , { input: '/invite A #B'
    , output: { type: 'invite', channel: '#b', nick: 'a' }
    }
  ]
, notice: [
    { input: '/notice', output: null }
  , { input: '/notice #a', output: null }
  , { input: '/notice #A This is a test'
    , output: { type: 'notice', target: '#a', message: 'This is a test'}
    }
  ]
, msg: [
    { input: '/msg', output: null }
  , { input: '/msg #a', output: null }
  , { input: '/msg #A This is a test'
    , output: { type: 'msg', target: '#a', message: 'This is a test'}
    }
  ]
, who: [
    { input: '/who', output: null }
  , { input: '/who *.fi', output: { type: 'who', mask: '*.fi', o: null } }
  , { input: '/who jto* o'
    , output: { type: 'who', mask: 'jto*', o: 'o' }
    }
  ]
, away: [
    { input: '/away', output: { type: 'away', message: null } }
  , { input: '/away Bye bye', output: { type: 'away', message: 'Bye bye' } }
  ]
}
