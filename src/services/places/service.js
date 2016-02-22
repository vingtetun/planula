'use strict';

dump('\tplaces\n');

importScripts('/src/shared/js/bridge/service.js');
importScripts('/src/shared/js/async_storage.js');
importScripts('/src/services/places/history.js');

bridge.service('history')
  .method('update', PlacesDatabase.update.bind(PlacesDatabase))
  .method('updateTitle', PlacesDatabase.updateTitle.bind(PlacesDatabase))
  .method('getMatches', PlacesDatabase.getMatches.bind(PlacesDatabase))
  .listen(new BroadcastChannel('history'));
