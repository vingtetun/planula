
(function onBrowserStartup(global) {
  'use strict';

  navigator.serviceWorker.register('sw.js').then(function(registration) {
    dump('ServiceWorker registration success for: ' + registration.scope + '\n');
  }).catch(function(error) {
    dump('ServiceWorker registration failed: ' + error + '\n');
  });

  const HOMEPAGE = 'about:home';

  let url = new URL(document.location.href).searchParams.get('url');

  Services.ready.then(() => {
    Services.tabs.method('add', {
      url: url || HOMEPAGE,
      loading: true,
      select: true
    });
  });

})(self);
