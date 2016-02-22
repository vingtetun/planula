/**
 *
 * buttons.js
 *
 * Implement an API to add/remove/update toolbar buttons
 *
 * These buttons are not specific to a tab, but can have
 * a state specific to a given one.
 *
 */

define([
  'popup-client'
], function(PopupClient) {
  let map = new Map();

  function getTemplate() {
    let template = document.getElementById('toolbar-template');
    return document.importNode(template.content, true);
  }

  function onClick(event) {
    let id = event.target.dataset.id;
    service.broadcast('click', { buttonId: id });
  }

  function createButton(options) {
    let button = document.createElement('button');
    button.className = 'toolbar-button';
    button.addEventListener('click', onClick);
    button.dataset.id = options.id;
    return button;
  }

  function getBadge(button) {
    return button.querySelector('.button-badge');
  }

  function createBadge(button) {
    let badge = document.createElement("div");
    badge.className = "button-badge";
    return button.appendChild(badge);
  }

  function removeBadge(button) {
    getBadge(button) && getBadge().remove();
  }

  /**
   * <toolbar-element> Impl
   */
  let p = Object.create(HTMLElement.prototype);

  p.createdCallback = function() {
    this.appendChild(getTemplate());
    map.forEach(this.update.bind(this));

    Services.toolbar.on('update', this.update.bind(this));
    Services.toolbar.on('openPopup', this.openPopup.bind(this));
  };

  p.attachedCallback = function() {
  };

  p.detachedCallback = function() {
  };

  /* Properties */

  /* Methods */
  p.add = function(options) {
    let button = createButton(options);
    button && this.appendChild(button);
    return button;
  };

  p.update = function(options) {
    let button = this.querySelector('[data-id="' + options.id + '"]') || this.add(options);

    button.setAttribute('title', options.title || '');

    if (options.icon) {
      button.innerHTML = '<img src="' + 
                         options.icon[Object.keys(options.icon)[0]] + 
                         '"></img>';
    } else {
      button.innerHTML = '';
    }

    if (options.badgeText) {
      let badge = getBadge(button) || createBadge(button);
      badge.textContent = options.badgeText;
      badge.style.backgroundColor = badge.badgeBackgroundColor || '';
    } else {
      removeBadge(button);
    }
  };

  p.openPopup = function(options) {
    let button = this.querySelector('[data-id="' + options.id + '"]');
    let rect = button.getBoundingClientRect();
    Services.popups.method('openPopup', {
      id: 'toolbar-popup',
      url: options.url,
      autofocus: true,
      anchor: { x: rect.x, y: rect.y + 29, width: rect.width, height: rect.height }
    });

    PopupClient.observe(button, 'toolbar-popup');
  };

  let Toolbar = {
    update: function(options) {
      map.set(options.id, options);
      service.broadcast('update', options);
    },

    openPopup: function(options) {
      service.broadcast('openPopup', options);
    }
  };

  let service =
    Services.service('toolbar')
            .method('ping', () => 'pong')
            .method('openPopup', Toolbar.openPopup.bind(Toolbar))
            .method('update', Toolbar.update.bind(Toolbar))
            .listen(new BroadcastChannel('toolbar'));

  return document.registerElement('toolbar-element', { prototype: p });
});
