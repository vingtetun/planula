
define([], function() {
  'use strict';
  dump('Parnet...\n');

  var SearchService = new BroadcastChannel('SearchService');
  SearchService.onmessage = function(msg) {
    dump('Parent side: get a msg from the broadcast channel: ' + msg.data.type + '\n');
  }
  dump('Parnet 2...\n');
});

