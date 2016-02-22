
//
// Startup prefs
//

//pref("toolkit.defaultChromeURI", "http://browserhtml.org/hidden.html");
pref("browser.chromeURL", "http://browserhtml.org:8081/index.html");
pref("permissions.manager.defaultsUrl", "http://browserhtml.org:8081/config/permissions");
pref("network.dns.localDomains", "browserhtml.org");

//
// Multi-Process prefs
//

pref("browser.tabs.remote.autostart", true);
pref("dom.ipc.processCount", 10000);

// Enable pre-launching content processes for improved startup time
// (hiding latency).
pref("dom.ipc.processPrelaunch.enabled", true);
// Wait this long before pre-launching a new subprocess.
pref("dom.ipc.processPrelaunch.delayMs", 5000);

//
// Additional dom apis
//

pref("dom.webcomponents.enabled", true);
pref("dom.mozBrowserFramesEnabled", true);
pref("dom.webextensions-uiglue.enabled", true);
pref("extensions.webextensions.addon_implementation", true);

//
// GFX Prefs
//
pref("layers.compositor-lru-size", 10);

//
// Extensions
//
pref("extensions.autoDisableScopes", 0);
pref("xpinstall.signatures.required", false);

//
// Debugging Prefs
//

// Caching

// Disable caching for html content
pref("browser.cache.disk.enable", false);

// Allow Service Worker over http.
// This normaly works only when the devtool toolbox is opened.
// But in our case, there is an addon that verify if this pref is turned on
// and force ServiceWorker over http to be allowed, even if the toolbox
// is not opened.
//
// If you want to use Service Worker you need to turn this pref on, and
// you also need to turn 'browser.cache.disk.enable' to true.
pref("devtools.serviceWorkers.testing.enabled", true);

// Ctrl-C to kill the browser ends up triggering
// the sage mode window. It's really annoying while
// hacking, so let disable that.
pref("toolkit.startup.max_resumed_crashes", -1);

// window.dump() on the console
pref("browser.dom.window.dump.enabled", true);

// Allow -jsdebugger flag
pref("devtools.debugger.remote-enabled", true);
pref("devtools.chrome.enabled", true);
pref("devtools.debugger.prompt-connection", false);

// Allow mozafterpaint event to be sent to content in order to print
// the time it takes to paint into src/shared/js/frame_timing.js
pref("dom.send_after_paint_to_content", true);
