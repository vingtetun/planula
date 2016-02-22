(function(global) {
  'use strict';

  function defineLazyGetter(obj, name) {
    Object.defineProperty(obj, name, {
      configurable: true,
      get: function() {
        return Object.defineProperty(obj, name, {
          __proto__: null,
          value: bridge.client(name, new BroadcastChannel(name), 60000),
          writable: false,
          enumerable: false,
          configurable: false
        })[name];
      }
    });
  }

  var Services = {};

  [
    'debug',
    'history',
    'windows',
    'tabs',
    'browsers',
    'toolbar',
    'popups',
    'suggestions',
    'shortcuts',
    'find',
    'urlbar'
  ].forEach(name => defineLazyGetter(Services, name));

  // Globally listen for key events.
  global.addEventListener('keypress', e => {
    let activeElement = document.activeElement;
    if (!activeElement || activeElement.contentDocument) {
      return;
    }

    // Reading key/keyCode may throw some security errors.
    let key;
    try {
      e.key;
      e.keyCode;
    } catch(e) {
      return;
    }

    Services.shortcuts.method('on', {
      key: e.key,
      keyCode: e.keyCode,
      ctrlKey: e.getModifierState('Control'),
      shiftKey: e.getModifierState('Shift'),
      metaKey: e.getModifierState('Meta'),
      altKey: e.getModifierState('Alt'),
    });
  });

  // If bridge.service is loaded, expose it via Services.service.
  // In some cases it is not needed. For example, the webextensions
  // code should be pure service consumption.
  if (bridge.service) {
    Services.service = bridge.service;
  }

  // Indicate if core Services are loaded and ready to be used.
  let pageIsLoaded = new Promise(function(resolve) {
    if (global.window && global.document.readyState === 'complete') {
      resolve();
    } else {
      addEventListener('load', resolve);
    }
  });

  Services.ready = Promise.all([
    , Services.tabs.method('ping')
    , Services.toolbar.method('ping')
  ]);

  global.Services = Services;
})(this);
