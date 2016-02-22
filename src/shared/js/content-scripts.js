/**
 * content-scripts.js
 *
 * Utility Helper to register scripts that should be injected into
 * remote content at runtime.
 *
 */

define([
  '/src/shared/js/urlhelper.js',
], function(UrlHelper) {
  'use strict';

  let scripts = {
     // * is a special url for all in-process scripts.
     '*':
      {
        parent: '',
        child: '/src/about/in-process/js/scripts/content.js'
      }
    , 'about:home':
      {
        parent: '/src/about/home/js/scripts/parent.js',
        child: '/src/about/home/js/scripts/content.js'
      }
  };

  // Scripts content cache
  let contents = {
  };

  function getScriptsForUrl(url) {
    let rv = [];

    let isOOP = UrlHelper.isOutOfProcessURL(url);
    if (!isOOP) {
      rv.push(scripts['*']);
    }

    if (scripts[url]) {
      rv.push(scripts[url]);
    }

    return rv;
  };
  
  return {
    get: function(url) {
      let rv = [];

      let scripts = getScriptsForUrl(url);
      scripts.forEach((script) => {

        // Register the parent script if any
        script.parent && require([script.parent]);


        // Get the content of the child script
        let xhr = new XMLHttpRequest();
        xhr.open('GET', script.child, false);
        xhr.send();
        contents[url] = content = xhr.responseText;

        rv.push(content);
      });

      return rv;
    }
  }
})
