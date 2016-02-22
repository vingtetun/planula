/**
 * browser.js
 *
 * browser implements the <browser> element. It's a wrapper
 * around a <iframe mozbrowser>.
 *
 */

define([
  '/src/shared/js/urlhelper.js',
  '/src/shared/js/content-scripts.js',
], function(UrlHelper, ContentScripts) {
  'use strict';

  const Tabs = Services.tabs;
  const History = Services.history;

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const FOREGROUND_BROADCAST_UPDATES_DELAY = 100;
  const BACKGROUND_BROADCAST_UPDATES_DELAY = 500;

  const IFRAME_EVENTS = [
    'mozbrowserasyncscroll'
    , 'mozbrowserclose'
    , 'mozbrowsercontextmenu'
    , 'mozbrowserselectmenu'
    , 'mozbrowsererror'
    , 'mozbrowsericonchange'
    , 'mozbrowserloadend'
    , 'mozbrowserloadstart'
    , 'mozbrowserlocationchange'
    , 'mozbrowseropentab'
    , 'mozbrowseropenwindow'
    , 'mozbrowsersecuritychange'
    , 'mozbrowsershowmodalprompt'
    , 'mozbrowsertitlechange'
    , 'mozbrowserusernameandpasswordrequired'
    , 'mozbrowsercontextmenu'
  ];

  /**
   * <browser-element> Impl
   */
  let browserProto = Object.create(HTMLElement.prototype);

  browserProto.createdCallback = function() {
    this._zoom = 1;
    this._clearBrowserData();
  };

  browserProto.attachedCallback = function() {
  };

  browserProto.detachedCallback = function() {
  };

  browserProto.configure = function(options) {

    this._uuid = options.uuid;
    this.service = Services.service(this._uuid)
                           .listen(new BroadcastChannel(this._uuid));
    options.url && this.navigate(options.url);
    options.select ? this.show() : this.hide();
  };

  /*
   * <browser-element> Properties
   */
  Object.defineProperty(browserProto, 'loading', {
    get: function() {
      return this._loading;
    }
  });

  Object.defineProperty(browserProto, 'uuid', {
    get: function() {
      return this._uuid;
    }
  });

  Object.defineProperty(browserProto, 'title', {
    get: function() {
      return this._title;
    }
  });

  Object.defineProperty(browserProto, 'location', {
    get: function() {
      return this._frameElement ? this._frameElement.src : '';
    }
  });

  Object.defineProperty(browserProto, 'favicon', {
    get: function() {
      return this._favicon;
    }
  });

  Object.defineProperty(browserProto, 'securityState', {
    get: function() {
      return this._securityState;
    }
  });

  Object.defineProperty(browserProto, 'securityExtendedValidation', {
    get: function() {
      return this._securityExtendedValidation;
    }
  });

  Object.defineProperty(browserProto, 'selected', {
    get: function() {
      return this.hasAttribute('selected');
    }
  });
  
  /*
   * <browser-element> methods
   */
  browserProto.maybeInjectScripts = function(url) {
    let frame = this._frameElement;
    frame.addEventListener('mozbrowserlocationchange', function f(e) {
      function success(url, desc) {
        dump('\nScript injection\n');
        dump('\t' + url + '\n');
        dump('\tsucces!\n');
        dump('\n');
      }

      function error(url, error) {
        dump('\nScript injection\n');
        dump('\t' + url + '\n');
        dump('\terror!\n');
        dump('\t' + error.name + '\n');
        dump('\t' + error.message + '\n');
        dump('\n');
      }

      let scripts = ContentScripts.get(e.detail);
      scripts.forEach((script) => {
        frame.executeScript(script, {url: e.detail})
          .then((msg) => {
            success(url);
          })
          .catch((error) => {
            error(url, error);
          });
      });
    });
  };

  browserProto.navigate = function(url) {
    if (!this._frameElement) {
      this._createFrameElement(UrlHelper.isOutOfProcessURL(url));
    }

    this._frameElement.src = url;
    this._frameElement.focus();
    this.focus();
    this.maybeInjectScripts(url);
  };

  browserProto.show = function() {
    if (this._frameElement) {
      this._frameElement.setVisible(true);
      this._frameElement.focus();

      if (this._location) {
        this._frameElement.focus();
        this.focus();
      }
    } else {
      Services.urlbar.method('focus');
    }

    this.setAttribute('selected', 'true');
  };

  browserProto.hide = function() {
    this._frameElement && this._frameElement.setVisible(false);
    this.removeAttribute('selected');
    this.blur();
  };

  browserProto._createFrameElement = function(remote) {
    let frameElement = document.createElement('iframe');
    frameElement.className = 'browser';
    frameElement.setAttribute('mozbrowser', 'true');
    frameElement.setAttribute('remote', remote);
    frameElement.setAttribute('mozallowfullscreen', 'true');
    frameElement.setAttribute('uuid', this.uuid);
    this.appendChild(frameElement);

    for (let eventName of IFRAME_EVENTS) {
      frameElement.addEventListener(eventName, this);
    }

    this._frameElement = frameElement;
    this._applyZoom();
  };

  browserProto.zoomIn = function() {
    this._zoom += 0.1;
    this._zoom = Math.min(MAX_ZOOM, this._zoom);
    this._applyZoom();
  };

  browserProto.zoomOut = function() {
    this._zoom -= 0.1;
    this._zoom = Math.max(MIN_ZOOM, this._zoom);
    this._applyZoom();
  };

  browserProto.resetZoom = function() {
    this._zoom = 1;
    this._applyZoom();
  };

  browserProto.methodCheck = function(name, args) {
    this._frameElement &&
    this._frameElement[name] &&
    this._frameElement[name].apply(this._frameElement, args || []);
  };

  browserProto._applyZoom = function() {
    this.methodCheck('zoom', [this._zoom]);
  };

  browserProto.reload = function() {
    this.methodCheck('reload');
  };

  browserProto.stop = function() {
    this.methodCheck('stop');
  };

  browserProto.goBack = function() {
    this.methodCheck('goBack');
  };

  browserProto.findAll = function(str, caseSensitive) {
    this.methodCheck('findAll', [str, caseSensitive]);
  };

  browserProto.findNext = function(str, direction) {
    this.methodCheck('findNext', [str, direction]);
  };

  browserProto.clearMatch = function() {
    this.methodCheck('clearMatch');
  };

  browserProto.goForward = function() {
    this.methodCheck('goForward');
  };

  browserProto.focus = function() {
    this.methodCheck('focus');
  };

  browserProto.blur = function() {
    this.methodCheck('blur');
  };


  browserProto.canGoBack = function() {
    if (!this._frameElement) {
      return Promise.resolve(false);
    }

    return this._frameElement.getCanGoBack();
  };

  browserProto.canGoForward = function() {
    if (!this._frameElement) {
      return Promise.resolve(false);
    }

    return this._frameElement.getCanGoForward();
  };

  browserProto.toggleDevtools = function() {
    if (this.tools) {
      this.tools.remove();
      this.tools = null;
      return;
    }
    let tools = this.tools = document.createElement('iframe');
    tools.setAttribute('mozbrowser', 'true');
    tools.setAttribute('flex', '1');
    tools.setAttribute('src', 'about:devtools-panel');
    tools.setAttribute('style', 'visibility:hidden');
    tools.target = this._frameElement;
    this.appendChild(tools);
  };

  browserProto._clearBrowserData = function() {
    this._loading = false;
    this._title = '';
    this._location = '';
    this._favicon = '';
    this._securityState = 'insecure';
    this._securityExtendedValidation = false;
  };

  browserProto.handleEvent = function(e) {
    switch (e.type) {
      case 'mozbrowseropenwindow':
        Tabs.method('add', {select: true, url: e.detail.url});
        break;
      case 'mozbrowseropentab':
        Tabs.method('add', {select: false, url: e.detail.url});
        break;
      case 'mozbrowserloadstart':
        this._clearBrowserData();
        this._loading = true;
        break;
      case 'mozbrowserloadend':
        this._loading = false;
        break;
      case 'mozbrowsertitlechange':
        this._title = e.detail;
        History.method('updateTitle', this._location, this._title);
        break;
      case 'mozbrowserlocationchange':
        this.userInput = '';
        this._location = e.detail;
        History.method('update', this._location);
        break;
      case 'mozbrowsericonchange':
        this._favicon = e.detail.href;
        break;
      case 'mozbrowsererror':
        this._loading = false;
        break;
      case 'mozbrowsersecuritychange':
        this._securityState = e.detail.state;
        this._securityExtendedValidation = e.detail.extendedValidation;
        break;
      case 'mozbrowsercontextmenu':
        // XXX Needs a way to handle selection
        Services.popups.method('openContextMenu', {
          data: JSON.parse(JSON.stringify(e.detail))
        });

        e.preventDefault();
        break;
      case 'mozbrowserselectmenu':
        // XXX Needs a way to handle selection
        Services.popups.method('openSelect', {
          data: JSON.parse(JSON.stringify(e.detail))
        });
        e.preventDefault();
        break;
      default:
        break;
    }

    // Coalesce the update events.
    clearTimeout(this._selectTimeout);

    let delay = this.selected ? FOREGROUND_BROADCAST_UPDATES_DELAY
                              : BACKGROUND_BROADCAST_UPDATES_DELAY;

    this._selectTimeout = setTimeout(() => {
      let data = {
        title: this.title,
        loading: this.loading,
        url: this._location,
        favicon: this.favicon, // XXX this is expensive...
        securityState: this._securityState,
        securityExtendedValidation: this._securityExtendedValidation
      };


      this.service.broadcast('update', data);
    }, delay);
  };

  return frameElement.ownerDocument.registerElement('browser-element', {prototype: browserProto});
});
