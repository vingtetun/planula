'use strict';

dump('\tshortcuts\n');

importScripts('/src/shared/js/os.js');
importScripts('/src/shared/js/bridge/client.js');
importScripts('/src/shared/js/bridge/service.js');
importScripts('/src/services/services.js');
importScripts('/src/services/shortcuts/shortcuts.js');

bridge.service('shortcuts')
  .method('on', Shortcuts.on.bind(Shortcuts))
  .listen(new BroadcastChannel('shortcuts'));
