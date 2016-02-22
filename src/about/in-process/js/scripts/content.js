(function installProxyAndForwardEvents() {
  'use strict';

  // This store a reference to the proxy iframe to make it
  // available throught the closure.
  let proxy = null;

  function run() {
    if (document.readyState === 'complete') {
      injectProxy(document.body || document.firstElementChild);
    } else {
      addEventListener('load', function onload() {
        removeEventListener('load', onload);
        injectProxy(document.body || document.firstElementChild);
      });
    }
  }

  function injectProxy(rootElement) {
    proxy = document.createElementNS(
      'http://www.w3.org/1999/xhtml',
      'iframe'
    );

    // The proxy needs to be a mozbrowser iframe in order to:
    //  - ensure it does not inherit the chrome scope
    //  - serve it from the same-origin than core services.
    proxy.setAttribute('mozbrowser', 'true');

    proxy.setAttribute('width', '0');
    proxy.setAttribute('height', '0');
    proxy.setAttribute('style', 'border: 0');
    proxy.src = getProxyUrl();

    rootElement.appendChild(proxy);
  }

  // The proxy url is a document that knows how to exchange messages
  // with the core services.
  function getProxyUrl() {
    return 'http://browserhtml.org:8081/src/about/in-process/proxy.html';
  }

  function forwardToProxy(data) {
    proxy.contentWindow.postMessage(
      Components.utils.cloneInto(data, proxy.contentWindow),
      '*'
    );
  }

  //
  // From here the code is dedicated to listen frame events and
  // forward them to the proxy.

  addEventListener('keypress', listenKeyPressEvents);

  function listenKeyPressEvents(e) {
    forwardToProxy({
      key: e.key,
      keyCode: e.keyCode,
      ctrlKey: e.getModifierState('Control'),
      shiftKey: e.getModifierState('Shift'),
      metaKey: e.getModifierState('Meta'),
      altKey: e.getModifierState('Alt')
    });
  };

  run();

})();
