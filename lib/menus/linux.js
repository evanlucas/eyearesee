'use strict'

module.exports = [
  { label: 'File'
  , submenu: [
      { label: 'Preferences', url: '/settings', accelerator: 'CmdOrCtrl+,' }
    , { label: 'Exit', command: 'application:quit' }
    ]
  }
, { label: 'Edit'
  , submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' }
    , { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' }
    , { type: 'separator' }
    , { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' }
    , { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' }
    , { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
    ]
  }
, { label: 'View'
  , submenu: [
      { label: 'Toggle DevTools', command: 'application:devtools' }
    , { type: 'separator' }
    , { label: 'Next Panel'
      , accelerator: 'CmdOrCtrl+Alt+Down'
      , command: 'application:next-panel'
      }
    , { label: 'Previous Panel'
      , accelerator: 'CmdOrCtrl+Alt+Up'
      , command: 'application:prev-panel'
      }
    , { label: 'Show Userbar'
      , accelerator: 'CmdOrCtrl+Alt+Left'
      , command: 'application:show-userbar'
      }
    , { label: 'Hide Userbar'
      , accelerator: 'CmdOrCtrl+Alt+Right'
      , command: 'application:hide-userbar'
      }
    ]
  }
, { label: 'Help'
  , submenu: [
      { label: 'About', url: '/about' }
    ]
  }
]
