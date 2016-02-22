require.config({
  scriptType: 'text/javascript;version=1.8',
  waitSeconds: 60
});

require([
  'browsers',
],
function(Browsers) {
  let Tabs = Services.tabs;
  Tabs.on('add', Browsers.add.bind(Browsers));
  Tabs.on('select', Browsers.select.bind(Browsers));
  Tabs.on('remove', Browsers.remove.bind(Browsers));

  function selectedBrowser() {
    return Browsers.selectedBrowser();
  }

  service = Browsers
    .service
    .method('ping', () => 'pong')
    .method('navigate', (options) => selectedBrowser().navigate(options.url))
    .method('reload', () => selectedBrowser().reload())
    .method('goBack', () => selectedBrowser().goBack())
    .method('goForward', () => selectedBrowser().goForward())
    .method('canGoBack', () => selectedBrowser().canGoBack())
    .method('canGoForward', () => selectedBrowser().canGoForward())
    .method('zoomIn', () => selectedBrowser().zoomIn())
    .method('zoomOut', () => selectedBrowser().zoomOut())
    .method('resetZoom', () => selectedBrowser().resetZoom())
    .method('findAll', (value) => selectedBrowser().findAll(value, 'case-insensitive'))
    .method('findForward', () => selectedBrowser().findNext('forward'))
    .method('findBackward', () => selectedBrowser().findNext('backward'))
    .method('clearMatch', () => selectedBrowser().clearMatch())
    .method('toggleDevtools', () => selectedBrowser().toggleDevtools())
    .listen(new BroadcastChannel('browsers'));

});
