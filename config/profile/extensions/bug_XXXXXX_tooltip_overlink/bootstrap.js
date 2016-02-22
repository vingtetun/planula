dump('bug_XXXXXX\n');

const Cu = Components.utils;
const Ci = Components.interfaces;
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'WindowUtils',
                                  'resource://webextensions/glue.jsm');

function startup() {
  let XULBrowserWindow = {
    setOverLink: function(url, anchorElm) {
      let data = {
        id: 'overlink',
        url: url
      };

      if (url) {
        WindowUtils.emit('popups', 'openOverLink', data);
      } else {
        WindowUtils.emit('popups', 'close', data);
      }
    },

    showTooltip: function (x, y, tooltip) {
      let data = {
        id: 'tooltip',
        x: this.x,
        y: this.y,
        tooltip: tooltip
      };

      WindowUtils.emit('popups', 'openTooltip', data);
    },

    hideTooltip: function() {
      let data = {
        id: 'tooltip'
      }
      WindowUtils.emit('popups', 'close', data);
    },

    x: 0,
    y: 0,
    trackMouseCursor(aWindow) {
      aWindow.addEventListener('mousemove', e => {
        this.x = (e.screenX - aWindow.mozInnerScreenX);
        this.y = (e.screenY - aWindow.mozInnerScreenY);
      });
    }
  };

  const ProgressListener = {
    onStateChange: function(webProgress, request, stateFlags, status) {
      if (stateFlags & Ci.nsIWebProgressListener.STATE_START) {
        let window = webProgress.DOMWindow;

        XULBrowserWindow.trackMouseCursor(window);

        let windowUtils = window.QueryInterface(Ci.nsIInterfaceRequestor)
                                .getInterface(Ci.nsIDOMWindowUtils);
        windowUtils.serviceWorkersTestingEnabled = true;
      }
    },

    onLocationChange: function(webProgress, request, location, flags) {},
    onSecurityChange: function(webProgress, request, state) {},
    onStatusChange: function(webProgress, request, status, message) {},
    onProgressChange: function(webProgress, request, curSelfProgress,
                               maxSelfProgress, curTotalProgress, maxTotalProgress) {},

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIWebProgressListener,
                                           Ci.nsISupportsWeakReference]),
  };

  function configureXULWindow(aXULWindow) {
    let window = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsIDOMWindow);

    window.QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIWebNavigation)
          .QueryInterface(Ci.nsIDocShellTreeItem).treeOwner
          .QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIXULWindow)
          .XULBrowserWindow = XULBrowserWindow;

    let useServiceWorkerOverHttp =
      Services.prefs.getBoolPref('browser.cache.disk.enable') &&
      Services.prefs.getBoolPref('devtools.serviceWorkers.testing.enabled');

    if (useServiceWorkerOverHttp) {
      window.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIWebNavigation)
            .QueryInterface(Ci.nsIDocShell)
            .QueryInterface(Ci.nsIWebProgress)
            .addProgressListener(
              ProgressListener,
              Ci.nsIWebProgress.NOTIFY_STATE_WINDOW
            );
    }
    
  }

  Services.wm.addListener({
    onOpenWindow: configureXULWindow,
    onCloseWindow: function(aXULWindow) {},
    onWindowTitleChange: function(aXULWindow, aNewTitle) {}
  });
}

function install() {
}

function shutdown() {
}
