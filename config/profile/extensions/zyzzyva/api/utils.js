
dump('Utils\n');

// Manages tab mappings and permissions for a specific extension.
function ExtensionTabManager(extension) {
  this.extension = extension;

  // A mapping of tab objects to the inner window ID the extension currently has
  // the active tab permission for. The active permission for a given tab is
  // valid only for the inner window that was active when the permission was
  // granted. If the tab navigates, the inner window ID changes, and the
  // permission automatically becomes stale.
  //
  // WeakMap[tab => inner-window-id<int>]
  this.hasTabPermissionFor = new WeakMap();
}

ExtensionTabManager.prototype = {
  addActiveTabPermission(tab = TabManager.activeTab) {
    if (this.extension.hasPermission("activeTab")) {
      // Note that, unlike Chrome, we don't currently clear this permission with
      // the tab navigates. If the inner window is revived from BFCache before
      // we've granted this permission to a new inner window, the extension
      // maintains its permissions for it.
      this.hasTabPermissionFor.set(tab, tab.linkedBrowser.innerWindowID);
    }
  },

  // Returns true if the extension has the "activeTab" permission for this tab.
  // This is somewhat more permissive than the generic "tabs" permission, as
  // checked by |hasTabPermission|, in that it also allows programmatic script
  // injection without an explicit host permission.
  hasActiveTabPermission(tab) {
    // This check is redundant with addTabPermission, but cheap.
    if (this.extension.hasPermission("activeTab")) {
      return (this.hasTabPermissionFor.has(tab) &&
              this.hasTabPermissionFor.get(tab) === tab.linkedBrowser.innerWindowID);
    }
    return false;
  },

  hasTabPermission(tab) {
    return this.extension.hasPermission("tabs") || this.hasActiveTabPermission(tab);
  },

  convert(tab) {
    let window = tab.ownerDocument.defaultView;

    let result = {
      id: TabManager.getId(tab),
      index: tab._tPos,
      windowId: WindowManager.getId(window),
      selected: tab.selected,
      highlighted: tab.selected,
      active: tab.selected,
      pinned: tab.pinned,
      status: TabManager.getStatus(tab),
      incognito: false, //PrivateBrowsingUtils.isBrowserPrivate(tab.linkedBrowser),
      width: tab.clientWidth,
      height: tab.clientHeight,
    };

    if (this.hasTabPermission(tab)) {
      dump("has tab permission\n");
      dump("tab="+tab+" parent:"+tab.parentNode+"\n");
      dump("location="+tab.parentNode._location+"\n");
      // XXX: horrible hack
      // Use the internals of the web component defined here
      // src/views/arena/controllers/components/browser.js
      result.url = tab.parentNode._location;
      /*
      if (tab.linkedBrowser.contentTitle) {
        result.title = tab.linkedBrowser.contentTitle;
      }
      let icon = window.gBrowser.getIcon(tab);
      if (icon) {
        result.favIconUrl = icon;
      }
      */
    }

    return result;
  },

  getTabs(window) {
    return Array.from(window.gBrowser.tabs, tab => this.convert(tab));
  },
};



// Overrides TabManager defined in browser/components/extensions/ext-utils.js
// in order to support generic HTML browser
global.TabManager = {
  _tabs: new WeakMap(),
  _nextId: 1,

  getIdForUUID(uuid) {
    let list = [];
    let frames = window => {
      let list = [...window.document.querySelectorAll("iframe")];
      for(let frame of list) {
        // XXX: uuid attribute
        // depends on the HTML layout, this is implemented by
        // src/views/arena/controllers/components/browser.js
        if (frame && frame.getAttribute("uuid") == uuid) {
          return this.getId(frame);
        }
        if (frame.contentWindow) {
          let tab = frames(frame.contentWindow);
          if (tab) {
            return tab;
          }
        }
      }
      return null;
    };
    for (let window of WindowListManager.browserWindows()) {
      let tab = frames(window);
      if (tab) {
        return tab
      }
    }
    return null;
  },

  getId(tab) {
    if (this._tabs.has(tab)) {
      return this._tabs.get(tab);
    }
    let id = this._nextId++;
    this._tabs.set(tab, id);
    return id;
  },

  getBrowserId(browser) {
    return this.getId(browser);
  },

  getTab(tabId) {
    let list = [];
    let frames = window => {
      let list = [...window.document.querySelectorAll("iframe")];
      for(let frame of list) {
        if (frame && this.getId(frame) == tabId) {
          return frame;
        }
        if (frame.contentWindow) {
          let tab = frames(frame.contentWindow);
          if (tab) {
            return tab;
          }
        }
      }
      return null;
    };
    for (let window of WindowListManager.browserWindows()) {
      let tab = frames(window);
      if (tab) {
        return tab
      }
    }
    return null;
  },

  get activeTab() {
    let window = WindowManager.topWindow;
    let frames = function(window) {
      for(let frame of window) {
        if (frame.frameElement.getVisible()) {
          return frame.frameElement;
        }
        let tab = frames(window);
        if (tab) {
          return tab;
        }
      }
      return null;
    };
    return frames(window);
  },

  getStatus(tab) {
    // TODO
    return "complete";
  },

  convert(extension, tab) {
    return TabManager.for(extension).convert(tab);
  },
};

// WeakMap[Extension -> ExtensionTabManager]
let tabManagers = new WeakMap();

// Returns the extension-specific tab manager for the given extension, or
// creates one if it doesn't already exist.
TabManager.for = function(extension) {
  if (!tabManagers.has(extension)) {
    tabManagers.set(extension, new ExtensionTabManager(extension));
  }
  return tabManagers.get(extension);
};

/* eslint-disable mozilla/balanced-listeners */
extensions.on("shutdown", (type, extension) => {
    tabManagers.delete(extension);
});
/* eslint-enable mozilla/balanced-listeners */

dump('Utils: parsed.\n');
