/**
 * modal.js
 *
 * A hack to not block on window.alert and friends.
 * This should be replaced by a proper handling in the right file
 * when ready.
 *
 */

define([], function() {
  'use strict';

  window.addEventListener('mozbrowsershowmodalprompt', function(e) {
    e.detail.returnValue = true;
    e.unblock();
  });
});

