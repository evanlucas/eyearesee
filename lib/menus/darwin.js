'use strict'

module.exports = [
  { label: 'eyearesee'
  , submenu: [
      { label: 'About', url: '/about' }
    , { label: 'Preferences'
      , url: '/settings'
      , accelerator: 'CmdOrCtrl+,'
      }
    , { type: 'separator' }
    , { label: 'Quit', accelerator: 'Command+Q', command: 'application:quit' }
    ]
  }
, { label: 'Edit'
  , submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' }
    , { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' }
    , { type: 'separator' }
    , { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' }
    , { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' }
    , { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' }
    ]
  }
, { label: 'View'
  , submenu: [
      { label: 'Toggle DevTools'
      , accelerator: 'CmdOrCtrl+Alt+I'
      , command: 'application:devtools'
      }
    , { type: 'separator' }
    , { label: 'Next Panel'
      , accelerator: 'CommandOrControl+Alt+Down'
      , command: 'application:next-panel'
      }
    , { label: 'Previous Panel'
      , accelerator: 'CommandOrControl+Alt+Up'
      , command: 'application:prev-panel'
      }
    , { label: 'Show Userbar'
      , accelerator: 'CommandOrControl+Alt+Left'
      , command: 'application:show-userbar'
      }
    , { label: 'Hide Userbar'
      , accelerator: 'CommandOrControl+Alt+Right'
      , command: 'application:hide-userbar'
      }
    ]
  }
, { label: 'Window'
  , submenu: [
      { label: 'Minimize'
      , accelerator: 'Command+M'
      , command: 'application:minimize'
      }
    , { label: 'Maximize', command: 'application:maximize' }
    , { label: 'Zoom', command: 'application:zoom' }
    ]
  }
, { label: 'Help'
  , submenu: [
      { label: 'Repository', command: 'application:open-repo' }
    ]
  }
]
