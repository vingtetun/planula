/**
 * browsers.js
 *
 * Browsers controls the list of <browser>s.
 *
 */

define([
  '../components/browser'
], function(Browser) {
  'use strict';

  const document = frameElement.ownerDocument;
  const root = document.getElementById('content');

  let _browserMap = new Map();
  let _selectedBrowser = null;

  const Browsers = {
    add: function(options) {
      let browser = document.createElement('browser-element');
      root.appendChild(browser);

      browser.configure(options);

      _browserMap.set(options.uuid, browser);

      if (options.select || !_selectedBrowser) {
        this.select(browser);
      }

      return browser;
    },

    remove: function(options) {
      let browser = _browserMap.get(options.uuid);
      if (!browser) {
        throw new Error('Unknown browser');
      }

      _browserMap.delete(options.uuid);
      browser.remove();
    },

    select: function(options) {
      let browser = _browserMap.get(options.uuid);
      if (!browser || browser == _selectedBrowser) {
        return;
      }

      let previouslySelectedBrowser = _selectedBrowser;
      _selectedBrowser = browser;

      _selectedBrowser.show();
      previouslySelectedBrowser && previouslySelectedBrowser.hide();
    },

    selectedBrowser: function() {
      return _selectedBrowser;
    }
  };

  Browsers.service = Services.service('browsers');
  return Browsers;
});
