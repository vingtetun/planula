/**
 * urlbar.js
 *
 * Implement the urlbar component.
 *
 */

define([
  '/src/shared/js/urlhelper.js'
], function(UrlHelper) {
  'use strict';

  const Popups = Services.popups;
  const Browsers = Services.browsers;
  const Places = {
    opened: false,
    id: 'places',

    open: function(data) {
      if (this.opened) {
        return;
      }
      this.opened = true;

      Popups.method('openPanel', {
        id: this.id,
        name: this.id,
        url: '/src/views/places/index.html',
        anchor: data.anchor
      });
    },

    close: function() {
      if (!this.opened) {
        return;
      }
      this.opened = false;

      Popups.method('close', {
        id: this.id
      });
    },

    update: function(data) {
      this.open(data);
      Popups.method('update', {
        id: this.id,
        data: data
      });
    }
  };

  function getTemplate() {
    let template = document.getElementById('urlbar-template');
    return document.importNode(template.content, true);
  }

  /**
   * <urlbar-element> Impl
   */
  let p = Object.create(HTMLElement.prototype);

  p.createdCallback = function() {
    this.appendChild(getTemplate());
    this.container = this.querySelector('.urlbar');
    this.input = this.querySelector('.urlinput');

    this.input.addEventListener('focus', this);
    this.input.addEventListener('blur', this);
    this.input.addEventListener('keypress', this);
    this.input.addEventListener('input', this);
  };

  p.attachedCallback = function() {
  };

  p.detachedCallback = function() {
  };


  /* Properties */
  Object.defineProperty(p, 'value', {
    get: function() {
      return this.input.value;
    },
    set: function(value) {
      this.input.value = value;
    }
  });

  p._preprocessUrlInput = function(input) {
    if (UrlHelper.isNotURL(input)) {
      let urlTemplate = 'https://search.yahoo.com/search?p={searchTerms}';
      return urlTemplate.replace('{searchTerms}', encodeURIComponent(input));
    }

    if (!UrlHelper.hasScheme(input)) {
      input = 'http://' + input;
    }

    return input;
  };

  p.focus = function() {
    this.input.select();
    this.input.focus();
    this.container.classList.add('focus');
  };

  p.blur = function() {
    Places.close();
    this.container.classList.remove('focus');
  };

  p.update = function() {
    if (this.value === '') {
      Places.close();
      return;
    }

    let rect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: 41
    };
    Places.update({anchor: rect, value: this.value });
  };

  p.validate = function() {
    Places.close();

    let url = this._preprocessUrlInput(this.value);
    Browsers.method('navigate', {url});
  };

  p.handleEvent = function(e) {
    switch (e.type) {
      case 'focus':
        this.focus();
        break;

      case 'blur':
        this.blur();
        break;

      case 'keypress':
        // XXX I wonder if not every keypress should be forwarded
        // to places directly...
        if (e.keyCode == 13) {
          this.validate();
        }

        if (Places.opened && (
            e.keyCode === 9 ||
            e.keyCode === 38 ||
            e.keyCode === 40)) {
          Places.update({ keycode: e.keyCode });
          e.preventDefault();
        }
        break;

      case 'input':
        this.userInput = this.value;
        this.update();
        break;
    }
  };

  return document.registerElement('urlbar-element', { prototype: p });
});
