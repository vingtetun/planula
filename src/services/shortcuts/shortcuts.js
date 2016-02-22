'use strict';

let allKeyBindings = [];

// Limit the repetition rate for shortcuts.
const KeyRepeatDelay = 150;
let lastKeyBinding = null;
let lastKeyTimestamp = 0;

function allowKeyShortcut(keyBinding) {
  if (lastKeyBinding === keyBinding &&
    Date.now() - lastKeyTimestamp < KeyRepeatDelay) {
    return false;
  }

  lastKeyBinding = keyBinding;
  lastKeyTimestamp = Date.now();

  return true;
}

const Shortcuts = {
  on: function(e) {
    for (let oneKeyBinding of allKeyBindings) {
      let matches = true;
      for (let prop in oneKeyBinding.event) {
        if (e[prop] != oneKeyBinding.event[prop]) {
          matches = false;
          break;
        }
      }

      if (matches && allowKeyShortcut(oneKeyBinding)) {
        oneKeyBinding.func.apply(null);
      }
    }
  }
};

function RegisterKeyBindings(...bindings) {
  for (let b of bindings) {
    let mods = b[0];
    let key = b[1];
    let func = b[2];

    let e = {
      ctrlKey: false,
      shiftKey: false,
      metaKey: false,
      altKey: false
    }

    if (mods.indexOf('Ctrl') > -1) e.ctrlKey = true;
    if (mods.indexOf('Shift') > -1) e.shiftKey = true;
    if (mods.indexOf('Alt') > -1) e.altKey = true;
    if (mods.indexOf('Cmd') > -1) e.metaKey = true;

    if (key.indexOf('code:') > -1) {
      e.keyCode = key.split(':')[1];
    } else {
      e.key = key;
    }
    allKeyBindings.push({event: e, func: func});
  }
}

let mod = self.OS == 'osx' ? 'Cmd' : 'Ctrl';
let modVariant = self.OS == 'osx' ? 'Cmd' : 'Alt';
let modShift = mod + ' Shift';

// Debug Shortcuts
RegisterKeyBindings(
  [mod, 'z', () => Services.debug.method('reload')]
);

// Find Shortcuts
RegisterKeyBindings(
  [mod, 'f', () => Services.find.method('open')]
);

// URLBar Shortcuts
RegisterKeyBindings(
  [mod, 'l', () => Services.urlbar.method('focus')],
  [mod, 'k', () => Services.urlbar.method('focus')]
);

// Tabs Shortcuts
RegisterKeyBindings(
  [mod, 'Tab', () => Services.tabs.method('selectNext')],
  [modShift, 'code:9', () => Services.tabs.method('selectPrevious')],
  [modShift, 'PageUp', () => Services.tabs.method('movePrevious')],
  [modShift, 'PageDown', () => Services.tabs.method('moveNext')],
  [mod, 'PageUp', () => Services.tabs.method('selectPrevious')],
  [mod, 'PageDown', () => Services.tabs.method('selectNext')],
  [mod, 't', () => Services.tabs.method('add', {select: true})],
  [mod, 'w', () => Services.tabs.method('remove')]
);

// Browsers Shortcuts
RegisterKeyBindings(
  ['', 'F5', () => Services.browsers.method('reload')],
  [mod, 'i', () => Services.browsers.method('toggleDevtools')],
  [mod, 'r', () => Services.browsers.method('reload')],
  [modShift, '+', () => Services.browsers.method('zoomIn')],
  [mod, '=', () => Services.browsers.method('zoomIn')],
  [mod, '-', () => Services.browsers.method('zoomOut')],
  [mod, '0', () => Services.browsers.method('resetZoom')],
  [modVariant, 'Left', () => Services.browsers.method('goBack')],
  [modVariant, 'Right', () => Services.browsers.method('goForward')]
);
