/**
 * urlhelper.js
 */

define(function() {

  'use strict';

  const INPROCESS_URLS = [
    // browser/components/about/AboutRedirector.cpp
      'about:socialerror'
    , 'about:tabcrashed'
    , 'about:providerdirectory'
    , 'about:feeds'
    , 'about:privatebrowsing'
    , 'about:rights'
    , 'about:robots'
    , 'about:sessionrestore'
    , 'about:welcomeback'
    , 'about:sync-tabs'
    , 'about:newtab'
    , 'about:preferences'
    , 'about:downloads'
    , 'about:healthreport'
    , 'about:accounts'
    , 'about:customizing'
    , 'about:loopconversation'
    , 'about:looppanel'
    // docShell/base/nsAboutRedirector.cpp
    , 'about:'
    , 'about:about'
    , 'about:addons'
    , 'about:buildconfig'
    , 'about:checkerboard'
    , 'about:config'
    , 'about:cache'
    , 'about:crashes'
    , 'about:credits'
    , 'about:debugging'
    , 'about:license'
    , 'about:logo'
    , 'about:memory'
    , 'about:mozilla'
    , 'about:networking'
    , 'about:newaddon'
    , 'about:performance'
    , 'about:preferences'
    , 'about:support'
    , 'about:telemetry'
    , 'about:webrtc'
    , 'about:devtools-panel'
  ];

  var rscheme = /^(?:[a-z\u00a1-\uffff0-9-+]+)(?::|:\/\/)/i;

  var UrlHelper = {

    // Placeholder anchor tag to format URLs.
    a: null,

    getUrlFromInput: function urlHelper_getUrlFromInput(input) {
      this.a = this.a || document.createElement('a');
      this.a.href = input;
      return this.a.href;
    },

    hasScheme: function(input) {
      return !!(rscheme.exec(input) || [])[0];
    },

    isURL: function urlHelper_isURL(input) {
      return !UrlHelper.isNotURL(input);
    },

    isOutOfProcessURL: function urlHelper_isOutOfProcessURL(input) {
      // Sometimes there are some parameters to about: pages.
      // Ideally it will be better to use |new URL(input)| but sadly
      // this kind of urls does not work in a way that would make that
      // useful.
      let url = input.split('?')[0];

      return INPROCESS_URLS.indexOf(url) === -1;
    },

    isNotURL: function urlHelper_isNotURL(input) {
      var schemeReg = /^\w+\:\/\//;

      // in bug 904731, we use <input type='url' value=''> to
      // validate url. However, there're still some cases
      // need extra validation. We'll remove it til bug fixed
      // for native form validation.
      //
      // for cases, ?abc and 'a? b' which should searching query
      var case1Reg = /^(\?)|(\?.+\s)/;
      // for cases, pure string
      var case2Reg = /[\?\.\s\:]/;
      // for cases, data:uri
      var case3Reg = /^(data\:)/;
      // for cases, about:uri
      var case4Reg = /^(about\:)/;
      // for cases, view-source:uri
      var case5Reg = /^(view-source\:)/;
      // for cases, only scheme but no domain provided
      var case6Reg = /^\w+\:\/*$/;
      var str = input.trim();
      if (case1Reg.test(str) || !case2Reg.test(str) || case6Reg.test(str)) {
        return true;
      }
      if (case3Reg.test(str) || case4Reg.test(str) || case5Reg.test(str)) {
        return false;
      }
      // require basic scheme before form validation
      if (!schemeReg.test(str)) {
        str = 'http://' + str;
      }
      if (!this.urlValidate) {
        this.urlValidate = document.createElement('input');
        this.urlValidate.setAttribute('type', 'url');
      }
      this.urlValidate.setAttribute('value', str);
      return !this.urlValidate.validity.valid;
    },

    trim: function(input) {
      // remove single trailing slash for http/https/ftp URLs
      let url = input.replace(/^((?:http|https|ftp):\/\/[^/]+)\/$/, '$1');

      // remove http://
      if (!url.startsWith('http://')) {
        return url;
      }

      return url.substring(7);
    }
  };

  return UrlHelper;
});
