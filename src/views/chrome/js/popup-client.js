/**
 *
 * popup-client.js
 *
 * A little helper for popups to make it easier to embed them.
 *
 */
define([], function() {
  let anchors = new Map();

  addEventListener('resize', () => {
    anchors.forEach(function(value, key) {
      let rect = value.getBoundingClientRect();
      Services.popups.method('update', {
        id: key,
        anchor: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      });
    });
  });

  Services.popups.on('popuphidden', (options) => {
    PopupClient.unobserve(options.id);
  });

  let PopupClient = {
    observe: function(anchor, id) {
      anchors.set(id, anchor);
    },

    unobserve: function(id) {
      anchors.delete(id);
    }
  };

  return PopupClient;
});

