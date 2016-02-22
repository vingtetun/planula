/**
 * popup.js
 *
 * Implements a web component for popups
 *
 */
define(['geometry/rect'], function(Rect) {
  'use strict';

  let popupProto = Object.create(HTMLElement.prototype);

  popupProto.createdCallback = function() {
    // First, look for a window with the same name. Iff none, create a
    // new one.
    let browser = this.browser = document.createElement('iframe');
    browser.setAttribute('ignoreuserfocus', 'true');

    browser.addEventListener('mozbrowserscrollareachanged', this);
    browser.addEventListener('mozbrowserloadend', this);
    this.addEventListener('focus', this);
    this.addEventListener('blur', this);

    this.ready = new Promise(function(resolve, reject) {
      browser.addEventListener('mozbrowserloadend', function foo(e) {
        browser.removeEventListener(e.type, foo);
        resolve(browser.contentWindow);
      });
    });

    this.rect = new Rect(0, 0, innerWidth, innerHeight);
    window.addEventListener('resize', this);
    window.addEventListener('click', this, true);
  };

  popupProto.attachedCallback = function() {
    this.setAttribute('tabindex', 0);

    if (this.getAttribute('autofocus') == 'true') {
      this.focus();
    }
  };

  popupProto.attachTo = function(anchor, useArrow, useConstraints) {
    if (!anchor) {
      throw new Error('AttachTo called without an anchor');
    }

    if (useArrow) {
      var arrow = this.arrow = document.createElement('div');
      arrow.className = 'arrow';
      this.appendChild(arrow);
    }

    if (anchor) {
      this.anchor = anchor;

      if (useConstraints) {
        this.rect.width = this.anchor.width;
        this.rect.height = this.anchor.height;
      }
    }

    this.move();
  };

  popupProto.forward = function(msg) {
    this.ready.then(function(target) {
      target.postMessage(msg, '*');
    });
  };

  popupProto.move = function(point = null) {
    if (!point) {
      point = {};

      if (this.anchor) {
        let anchorRect = this.anchor;
        point.x = anchorRect.x;
        point.y = anchorRect.y + anchorRect.height;
      } else {
        point.x = this.rect.x;
        point.x = this.rect.y;
      }
    }

    this.rect.x = point.x;
    this.rect.y = point.y;
    this.rect.width = this.rect.width || (innerWidth - point.x);
    this.rect.height = this.rect.height || (innerHeight - point.y);

    var margins = new Rect(10, 10, innerWidth - 20, innerHeight - 20);
    if (this.hasAttribute('usemargins')) {
      this.rect = this.rect.translateInside(margins);
    }

    this.style.top = this.rect.y + 'px'
    this.style.left = this.rect.x + 'px';
    this.style.width = this.rect.width + 'px';
    this.style.height = this.rect.height + 'px';
    this.style.maxWidth = (this.maxWidth || this.rect.width) + 'px';
    this.style.maxHeight = (this.maxHeight || this.rect.height) + 'px';

    if (this.anchor && this.arrow) {
      let anchorRect = this.anchor;
      let rect = new Rect(
        anchorRect.x + anchorRect.width / 2,
        anchorRect.y + anchorRect.height,
        0,
        0
      );

      let arrowRect = this.arrow.getBoundingClientRect();

      let offsetX = (rect.x - this.rect.x) - arrowRect.width / 2;
      this.arrow.style.left = Math.max(3, offsetX) + 'px';
    }
  };

  popupProto.handleEvent = function(e) {
    switch (e.type) {
      case 'mozbrowserscrollareachanged':
          this.rect.width = this.maxWidth = e.detail.width;
          this.rect.height = this.maxHeight = e.detail.height;
          this.move();
        break;

      case 'mozbrowserloadend':
        this.browser.getContentDimensions().onsuccess = (e) => {
          this.rect.width = this.maxWidth = e.target.result.width;
          this.rect.height = this.maxHeight = e.target.result.height;
          this.move();
          this.removeAttribute('hidden');
        };
        break;

      case 'resize':
        this.move();
        break;

      case 'blur':
        this.close(e);
        break;
    }
  };

  popupProto.close = function(e) {
    window.removeEventListener('focus',this);
    window.removeEventListener('blur', this);
    window.addEventListener('resize', this);

    require('popuphelper').close(this);
  };

  popupProto.setLocation = function(url) {
    var target = new URL(url, document.location);
    this.browser.setAttribute('mozbrowser', true);
    this.setAttribute('hidden', 'true');
    // XXX Should be remote for http i guess
    //this.browser.setAttribute('remote', true);

    this.browser.src = url;
    this.appendChild(this.browser);
  };

  let Popup = document.registerElement('popup-element', {prototype: popupProto});

  return Popup;
});
