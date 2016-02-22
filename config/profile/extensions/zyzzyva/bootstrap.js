dump("bootstrap\n");

const Cu = Components.utils;
const Ci = Components.interfaces;

// Register the manifest early, so the override in chrome.manifest
// takes effect before web extensions scripts are inserted into the
// addon scope.
(function loadManifest() {
  Cu.import("resource://gre/modules/Services.jsm");
  let manifest = Services.dirsvc.get('ProfD', Ci.nsIFile);
  manifest.append('extensions');
  manifest.append('zyzzyva');
  Components.manager.addBootstrappedManifestLocation(manifest);
})();

function startup() {
  Cu.import("resource://gre/modules/ExtensionManagement.jsm");
  ExtensionManagement.registerScript("resource://webextensions/utils.js");
}

function install() {
}

function shutdown() {
  (function unloadManifest() {
    Cu.import("resource://gre/modules/Services.jsm");
    let manifest = Services.dirsvc.get('ProfD', Ci.nsIFile);
    manifest.append('extensions');
    manifest.append('zyzzyva');
    Components.manager.removeBootstrappedManifestLocation(manifest);
  })();
}
