'use strict';

dump('\tsuggestions\n');

importScripts('/src/shared/js/bridge/service.js');
importScripts('/src/services/suggestions/opensearch.js');

var runningXHR = null;

bridge.service('suggestions')
  .method('get', function(url) {
    if (runningXHR && runningXHR.cancel) {
      runningXHR.cancel();
    }

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest({mozSystem: true});
      xhr.open('GET', url, true);
      xhr.send();
      runningXHR = xhr; 

      xhr.onload = function() {
        runningXHR = null;
        resolve(JSON.parse(xhr.response)[1]);
      }

      xhr.onerror = function() {
        runningXHR = null;
        reject();
      }
    });
  })
  .method('getPlugins', () => self.plugins)
  .listen(new BroadcastChannel('suggestions'));
