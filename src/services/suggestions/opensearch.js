'use strict';

dump('\topensearch\n');

const URLTYPE_SUGGEST_JSON = 'application/x-suggestions+json';
const URLTYPE_SEARCH_HTML  = 'text/html';
const URLTYPE_OPENSEARCH   = 'application/opensearchdescription+xml';

function dumpObject(obj, level = 0) {
  var indent = '';
  for (var i = 0; i < level; i++) {
    indent += '\t';
  }

  for (var key in obj) {
    if (typeof obj[key] == 'object') {
      dump(indent + key + '\n');
      dumpObject(obj[key], level + 1);
    } else {
      dump(indent + key + ': ' + obj[key] + '\n');
    }
  }
}

function Deferred() {
  // update 062115 for typeof
  if (typeof(Promise) != 'undefined' && Promise.defer) {
    //need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
    return Promise.defer();
  } else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
    //need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
    return PromiseUtils.defer();
  } else {
    /* A method to resolve the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} value : This value is used to resolve the promise
     * If the value is a Promise then the associated promise assumes the state
     * of Promise passed as value.
     */
    this.resolve = null;

    /* A method to reject the assocaited Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} reason: The reason for the rejection of the Promise.
     * Generally its an Error object. If however a Promise is passed, then the Promise
     * itself will be the reason for rejection no matter the state of the Promise.
     */
    this.reject = null;

    /* A newly created Pomise object.
     * Initially in pending state.
     */
    this.promise = new Promise(function(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));
    Object.freeze(this);
  }
}

(function(global) {
  importScripts('/src/shared/js/lib/sax.js');
  
  function fetchUrl(url) {  
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest({mozSystem: true});
      xhr.open('GET', url, true);
      xhr.send();
    
      xhr.onload = function() {
        resolve(xhr.response);
      }

      xhr.onerror = function() {
        reject();
      }
    });
  };

  function LineParser(data) {
    let datas = data.split('\n');
    datas.pop();
    return datas;
  }

  function XMLParser(data) {
    let rv = {}

    let targets = [rv];
    function calculateTarget() {
      return targets[targets.length - 1];
    }

    function addValue(value) {
      if (!value || !value.trim()) {
        return;
      }

      let target = calculateTarget();
      target.value = value;
    }

    function addAttribute(name, value) {
      if (!value || !value.trim()) {
        return;
      }

      name = name.toLowerCase();

      let target = calculateTarget();

      if (!target.attributes) {
        target.attributes = {};
      }

      target.attributes[name] = value;
    }

    function pushTag(name) {
      let target = calculateTarget();

      name = name.toLowerCase();

      let tag = {
        name: name,
      };

      if (!target.childs) {
        target.childs = [];
      }

      target.childs.push(tag);
      targets.push(tag);
    }

    function popTag() {
      targets.pop();
    }

    let parser = global.sax.parser();

    parser.onerror = function(e) {
      throw new Error(e);
    }

    parser.ontext = function(text) {
      addValue(text);
    }

    parser.onopentag = function(node) {
      pushTag(node.name);

      for (let attr in node.attributes) {
        addAttribute(attr, node.attributes[attr]);
      }
    }

    parser.onclosetag = function(node) {
      popTag();
    }

    parser.onend = function() {
    }

    parser.write(data).close();
    return rv;
  }

  let kDefaultLanguage = 'en-US';
  let kPluginsRootUrl = '/src/services/suggestions/plugins/' +
                        kDefaultLanguage +
                        '/';
  let kPluginsListUrl = kPluginsRootUrl + '/list.txt';

  let contents = {};

  function getPluginsList(url) {
    return fetchUrl(kPluginsListUrl).then((data) => {
      let urls = LineParser(data).map((name) => {
        return kPluginsRootUrl + name + '.xml';
      });

      return Promise.resolve(urls);
    });
  }

  function getPluginsData(urls) {
    let promises = urls.map((url) => {
      return fetchUrl(url).then((response) => {
        return Promise.resolve(XMLParser(response));
      });
    });

    return Promise.all(promises);
  }

  function buildPluginsValue(values) {
    let plugins = [];

    values.forEach(function(value) {
      let plugin = {
        name: null,
        description: null,
        encoding: null,
        icons: [],
        suggestion: null,
        url: null
      }

      let childs = value.childs[0].childs;
      childs.forEach(function(node) {
        switch (node.name) {
          case 'shortname':
            plugin.name = node.value;
            break;

          case 'description':
            plugin.description = node.value;
            break;

          case 'image':
            if (node.attributes.width == 16 && node.attributes.height == 16) {
              plugin.icons.push(node.value);
            }
            break;

          case 'inputencoding':
            plugin.encoding = node.value;
            break;

          case 'url':
            if (node.attributes.type == URLTYPE_SUGGEST_JSON) {
              plugin.suggestion = buildUrl(node);
            }

            if (node.attributes.type == URLTYPE_SEARCH_HTML) {
              plugin.url = buildUrl(node);
            }
            break;
        }

        //dump('\n\n\n\n\n');
        //dumpObject(node);
        //dump('\n\n\n\n\n');
      });

      //dump('Plugin:\n\n');
      //dumpObject(plugin);
      //dump('\n\n\n\n\n');
      plugins.push(plugin);
    });

    return plugins;
  }

  function buildUrl(node) {
    let url = node.attributes.template;
    let params = '?';
    node.childs && node.childs.forEach(function(param) {
      params += param.attributes.name + '=' + param.attributes.value + '&';
    });

    params = params.replace(/&$/, '');

    return url + params;
  }

  let globalPromise = new Deferred();
  let cache = null;
  function cacheResults(plugins) {
    cache = plugins;
    globalPromise.resolve(cache);
  }

  getPluginsList(kPluginsListUrl)
    .then(getPluginsData)
    .then(buildPluginsValue)
    .then(cacheResults);

  global.plugins = globalPromise.promise;

})(self);

