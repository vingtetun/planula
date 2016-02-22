'use strict';

define(function() {
  'use strict';

  function generateUUID() {
    var timestamp = Date.now();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function onEachCharacter(c) {
        var r = (timestamp + Math.random() * 16) % 16 | 0;
        timestamp = Math.floor(timestamp / 16);
        return (c == 'x' ? r : (r&0x7|0x8)).toString(16);
      }
    );
  }

  return {
    generate: generateUUID
  };
});
