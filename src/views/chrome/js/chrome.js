/**
 * chrome.js
 *
 * chrome implements the <chrome> element. It's a wrapper
 * around a <iframe mozchrome>.
 *
 */

define([
  '/src/shared/js/urlhelper.js',
  'urlbar',
  'toolbar'
], function(UrlHelper, UrlBar, Toolbar) {
  'use strict';

  const Browsers = Services.browsers;

  function getTemplate() {
    let template = document.getElementById('chrome-template');
    return document.importNode(template.content, true);
  }

  /**
   * <chrome-element> Impl
   */
  let chromeProto = Object.create(HTMLElement.prototype);

  chromeProto.createdCallback = function() {
    this._prepareContent();
  };

  chromeProto.attachedCallback = function() {
  };

  chromeProto.detachedCallback = function() {
  };

  chromeProto.configure = function(options) {
    this.client =
      bridge.client(options.uuid, new BroadcastChannel(options.uuid), 60000);
    this.client.on('update', (config) => {this.refresh(config);});

    this._uuid = options.uuid;
  };

  chromeProto.refresh = function(config) {
    this.ui.navbar.classList.toggle('loading', config.loading);

    if (this.ui.input.userInput) {
      this.ui.input.value = this.ui.input.userInput;
    } else if (config.url) {
      this.ui.input.value = UrlHelper.trim(config.url);
    } else {
      this.ui.input.value = '';
    }

    let ssl = config.securityState === 'secure';
    let sslev = !!config.securityExtendedValidation;
    this.ui.navbar.classList.toggle('ssl', ssl); 
    this.ui.navbar.classList.toggle('sslev', ssl && sslev); 

    Services.browsers.method('canGoBack').then(canGoBack => {
      this.ui.back.classList.toggle('disabled', !canGoBack);
    });

    Services.browsers.method('canGoForward').then(canGoForward => {
      this.ui.forward.classList.toggle('disabled', !canGoForward);
    });
  };

  chromeProto.show = function() {
    // XXX Ugly...
    this.style.display = '';
    this.ui.input.show();
  };

  chromeProto.hide = function() {
    // XXX Ugly...
    this.style.display = 'none';
    this.ui.input.hide();
  };

  Object.defineProperty(chromeProto, 'uuid', {
    get: function() {
      return this._uuid;
    }
  });

  chromeProto._prepareContent = function() {
    let shadow = this.createShadowRoot();
    shadow.appendChild(getTemplate());

    this.ui = {
      navbar: shadow.querySelector('.navbar'),
      input: shadow.querySelector('urlbar-element'),
      back: shadow.querySelector('.back-button'),
      forward: shadow.querySelector('.forward-button'),
      reload: shadow.querySelector('.reload-button'),
      stop: shadow.querySelector('.stop-button'),
    };

    this.ui.back.onclick = () => Browsers.method('goBack');
    this.ui.forward.onclick = () => Browsers.method('goForward');
    this.ui.reload.onclick = () => Browsers.method('reload');
    this.ui.stop.onclick = () => Browsers.method('stop');
  };

  return document.registerElement('chrome-element', {prototype: chromeProto});
});
