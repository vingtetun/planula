/**
 * urlbar.js
 *
 * Implement the urlbar component.
 *
 */

define([], function() {
  'use strict';

  let _currentSelected = null;

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
        anchor: data.anchor,
        constraints: true
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

  p.focus = function() {
    this.input.select();
    this.input.focus();
    this.container.classList.add('focus');
  };

  p.blur = function() {
    Places.close();
    this.container.classList.remove('opened');
    this.container.classList.remove('focus');
  };

  p.update = function() {
    if (this.value === '') {
      Places.close();
      this.container.classList.remove('opened');
      return;
    }

    let boundingRect = this.container.getBoundingClientRect();
    let rect = {
      x: boundingRect.x,
      y: boundingRect.y + 29,
      width: boundingRect.width,
      height: boundingRect.height
    };
    Places.update({anchor: rect, value: this.value });
    this.container.classList.add('opened');
  };

  p.validate = function(url) {
    Places.close();
    this.container.classList.remove('opened');
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
        if (Places.opened && (
            e.keyCode === 9 ||
            e.keyCode === 13 ||
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
    };
  };

  p.show = function() {
    _currentSelected = this;
  };

  p.hide = function() {
  };

  Services.service('urlbar')
    .method('focus', () => {
      _currentSelected.focus();
    })
    .method('navigate', (options) => {
      _currentSelected.value = options.url
      _currentSelected.userInput = options.url;

      if (options.load) {
        _currentSelected.validate(options.url);
      }
    })
    .listen(new BroadcastChannel('urlbar'));

  return document.registerElement('urlbar-element', { prototype: p });
});
