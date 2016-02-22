/**
 * apis.js
 *
 * This file is not meant to be required by many modules.
 * Instead it should be included the root of the dependencies,
 * loading other resources, and wrapping the necessaries one as
 * exposed APIs.
 *
 */

require.config({
  scriptType: 'text/javascript;version=1.8',
  waitSeconds: 60
});


require([
  'tabs',
  'tabstrip'
],
function(Tabs) {
  // Startup core services early.
  new SharedWorker('/src/workers/worker.js');

  Services.debug.on('reload', () => document.location.reload(true));

  /*
   * Tabs API
   *
   * Broadcast: 
   *  - add(config)
   *  - update(config)
   *  - remove(config)
   *  - unselect(uuid)
   *  - select(config)
   *  - move({uuid, direction})
   *
   */
  Tabs
    .service
    .method('ping', () => 'pong')
    .method('select', Tabs.select.bind(Tabs))
    .method('add', Tabs.add.bind(Tabs))
    .method('remove', Tabs.remove.bind(Tabs))
    .method('getSelected', Tabs.getSelected.bind(Tabs))
    .method('select', Tabs.select.bind(Tabs))
    .method('selectPrevious', Tabs.selectPrevious.bind(Tabs))
    .method('selectNext', Tabs.selectNext.bind(Tabs))
    .method('movePrevious', Tabs.movePrevious.bind(Tabs))
    .method('moveNext', Tabs.moveNext.bind(Tabs))
    .method('viewsource', function() {
      let url = 'view-source:' + Tabs.getSelected().url;
      Tabs.add({select: true, url: url});
    })
    .listen(new BroadcastChannel('tabs'));

  Services.service('windows')
    .method('open', (data) => {
      window.open(data.url, '_blank');
    })
    .listen(new BroadcastChannel('windows'));
});
