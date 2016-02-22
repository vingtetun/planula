
dump("Tabs\n");

Cu.import("resource://webextensions/glue.jsm");
Cu.import("resource://gre/modules/ExtensionUtils.jsm");
var {
    EventManager,
} = ExtensionUtils;


function getSender(context, target, sender) {
  // The message was sent from a content script to a <browser> element.
  // We can just get the |tab| from |target|.
  if (target.tagName == "IFRAME") {
    // The message came from a content script.
    sender.tab = TabManager.convert(context.extension, target);
  } else if ("tabId" in sender) {
    // The message came from an ExtensionPage. In that case, it should
    // include a tabId property (which is filled in by the page-open
    // listener below).
    sender.tab = TabManager.convert(context.extension, TabManager.getTab(sender.tabId));
    delete sender.tabId;
  }
}

/* eslint-disable mozilla/balanced-listeners */
// This listener fires whenever an extension page opens in a tab
// (either initiated by the extension or the user). Its job is to fill
// in some tab-specific details and keep data around about the
// ExtensionPage.
extensions.on("page-load", (type, page, params, sender, delegate) => {
  if (params.type == "tab" || params.type == "popup") {
    let browser = params.docShell.chromeEventHandler;

    //let parentWindow = browser.ownerDocument.defaultView;
    //page.windowId = WindowManager.getId(parentWindow);

    if (params.type == "tab") {
      page.tabId = sender.tabId = TabManager.getId(browser);
    }

    //pageDataMap.set(page, {tab, parentWindow});
  }

  delegate.getSender = getSender;
});

let tabListeners = new Set();
function onTabSelect({uuid, url, title}) {
  let tab = {
    id: TabManager.getIdForUUID(uuid),
    url: url,
    title: title
    // TODO: support other properties
  };
  tabListeners.forEach(f => {
    f(tab);
  });
}
WindowUtils.on("tabs", "select", onTabSelect);

extensions.registerSchemaAPI("tabs", null, (extension, context) => {
  return {
    tabs: {
      onActivated: new EventManager(context, "tabs.onActivated", fire => {
          let listener = (tab) => {
            fire({tabId: tab.id, windowId: "TODO"});
          };
          tabListeners.add(listener);
          return () => {
            tabListeners.remote(listener);
          };
        }).api(),

      get(tabId) {
        let tab = TabManager.getTab(tabId);
        return Promise.resolve(TabManager.convert(extension, tab));
      },

      create(createProperties) {
        WindowUtils.emit('tabs', 'add', {
          select: true,
          url: createProperties.url
        });
      },
    },
  };
});

dump("Tabs.js: parsed\n");
