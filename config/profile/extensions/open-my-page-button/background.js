chrome.browserAction.onClicked.addListener(openMyPage);
 
function openMyPage() {
  chrome.tabs.create({
    "url": chrome.extension.getURL("my-page.html")
  }); 
 }
 
