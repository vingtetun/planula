"use strict";

chrome.tabs.onActivated.addListener(function ({tabId, windowId}) {
  dump("TabID >> "+tabId+"\n");
  chrome.tabs.get(tabId, function (tab) {
    let url = tab.url;
    dump("tabs.get > "+tab+" / "+url+"\n");
    chrome.bookmarks.getTree(function (results) {
      dump("getTree > "+results.length+"\n");
      let hasBookmark = false;
      let search = function (node) {
        dump(" - "+node.url+" / "+node.title+"\n");
        if (node.url == url)
          hasBookmark = true;
        if (node.children)
          node.children.forEach(search);
      };
      results.forEach(search);

      if (!hasBookmark) {
        chrome.browserAction.setIcon({ path: "unstarred.png" });
        //chrome.browserAction.setPopup({ popup: null });
      } else {
        chrome.browserAction.setIcon({ path: "starred.png" });
        //chrome.browserAction.setPopup({ popup: "bookmark.html" });
      }
    });
  });
});
chrome.browserAction.onClicked.addListener(function (tab) {
  dump("onClicked "+tab.url+" / "+tab.title+" \n");
  chrome.browserAction.setIcon({ path: "starred.png" });
  chrome.bookmarks.create({url: tab.url, title: tab.title});
});
