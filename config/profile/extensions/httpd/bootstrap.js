/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

function startup(data, reason) {
  const CC = Components.Constructor;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;
  const Cm = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);

  Cu.import('resource://gre/modules/Services.jsm');
  Cu.import("resource://gre/modules/NetUtil.jsm");

  const LocalFile = CC('@mozilla.org/file/local;1',
                       'nsILocalFile',
                       'initWithPath');

  let baseDir = Cc['@mozilla.org/process/environment;1']
                  .getService(Ci.nsIEnvironment)
                  .get('MOZ_BASE_DIR');

  // Used when built from mozilla-central.
  // The build system automagically copy it to "checkout" folder
  let checkout = data.installPath.clone();
  checkout.append('checkout');
  if (checkout.exists()) {
    baseDir = checkout.path;
  }

  if (!baseDir) {
    dump('You must specify the directory where the UI comes from.\n');
    dump('Use MOZ_BASE_DIR as an env variable.\n');
    return;
  }
  baseDir = new LocalFile(baseDir);

  dump("baseDir > "+baseDir.path+"\n");
  let module = data.installPath.clone();
  module.append("httpd.js");
  let httpdURL = NetUtil.ioService.newFileURI(module).QueryInterface(Ci.nsIURL).spec;
  dump("httpds.js > "+httpdURL+"\n");
  let httpd = {};
  Services.scriptloader.loadSubScript(httpdURL, httpd);
  let server = new httpd.nsHttpServer();
  server.registerDirectory('/', baseDir);
  server.start(8081);
  server.identity.add("https", "browserhtml.org", 8081);
}

function shutdown(data, reason) {
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
