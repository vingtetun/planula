'use strict';

dump('\tdebug\n');

importScripts('/src/shared/js/bridge/service.js');

/*
 * Debug API
 *
 */
(function() {
  let service = bridge.service('debug');
  service
    .method('reload', () => service.broadcast('reload'))
    .listen(new BroadcastChannel('debug'));
})();

