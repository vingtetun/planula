/**
 * chromes.js
 *
 */

define(
  [
    'chrome',
  ],
function(Chrome) {

  'use strict';

  let _chromeMap = new Map();
  let _selectedChrome = null;

  const Chromes = {
    add: function(config={}) {
      let chrome = document.createElement('chrome-element');
      chrome.setAttribute('flex', '1');
      chrome.configure(config);

      let parent = document.querySelector('#outervbox');
      parent.appendChild(chrome);

      _chromeMap.set(config.uuid, chrome);
      if (config.select || !_selectedChrome) {
        this.select(config);
      }

      return chrome;
    },

    remove: function(config) {
      let chrome = _chromeMap.get(config.uuid);
      if (!chrome) {
        throw new Error('Unknown chrome');
      }

      _chromeMap.delete(config.uuid);
      chrome.remove();
    },

    select: function(config) {
      let chrome = _chromeMap.get(config.uuid);
      if (!chrome || chrome === _selectedChrome) {
        return;
      }

      let previouslySelectedChrome = _selectedChrome;

      _selectedChrome = chrome;
      _selectedChrome.show();

      if (previouslySelectedChrome) {
        previouslySelectedChrome.hide();
      }
    },

    getSelected: function() {
      return _selectedChrome;
    }
  }

  let Tabs = Services.tabs;
  Tabs.on('add', Chromes.add.bind(Chromes));
  Tabs.on('select', Chromes.select.bind(Chromes));
  Tabs.on('remove', Chromes.remove.bind(Chromes));

  return Chromes;
});
