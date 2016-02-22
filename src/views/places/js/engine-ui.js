
define([], function() {
  let engines = [];

  const Engine = {
    add: function(infos) {
      let engine = document.createElement('span');
      engine.id = infos.name;
      engine.className = 'engine';
      engine.style.backgroundImage = 'url(' + infos.icons[0] + ')';
      infos.suggestion && engine.setAttribute('suggestion', infos.suggestion);
      engine.setAttribute('url', infos.url);
      engine.setAttribute('description', infos.description);

      let container = document.getElementById('engines-container');
      container.appendChild(engine);

      if (container.childNodes.length === 1) {
        container.firstChild.classList.add('selected');
      }
    },

    remove: function() {
    },

    update: function() {
    },

    select: function() {
    },

    unselect: function() {
    },

    getSelected: function() {
      return document.querySelector('.engine.selected');
    },

    getMetadata: function(value) {
      let rv = {
        description: '',
        suggestions: null,
        navigation: null
      };

      let engine = this.getSelected();
      if (!engine) {
        return rv;
      }

      if (engine.hasAttribute('description')) {
        rv.description = engine.getAttribute('description');
      }

      if (engine.hasAttribute('suggestion')) {
        let suggestions = engine.getAttribute('suggestion');
        suggestions = suggestions.replace('{searchTerms}', value);
        suggestions = suggestions.replace(/ /g, '%20');
        suggestions = suggestions.replace('{moz:locale}', 'en-US');
        rv.suggestions = suggestions;
      }

      if (engine.hasAttribute('url')) {
        let navigation = engine.getAttribute('url');
        navigation = navigation.replace('{searchTerms}', value);
        navigation = navigation.replace(/ /g, '%20');
        navigation = navigation.replace('{moz:locale}', 'en-US');
        rv.navigation = navigation;
      }

      return rv;
    },

    selectWithShortcut: function(shortcut) {
      let engines = document.querySelectorAll('.engine');

      let match = Array.prototype.some.call(engines, function(engine) {
        return engine.id[0].toLowerCase() === shortcut;
      });

      if (match) {
        Array.prototype.forEach.call(engines, function(engine) {
          let match = engine.id[0].toLowerCase() === shortcut;
          engine.classList.toggle('selected', match);
        });
      };
    },

    ready: null
  };

  Engine.ready = new Promise(function(resolve) {
    Services.suggestions.method('getPlugins').then(function(plugins) {
      function sort(a, b) {
        if (a.name === 'Google') {
          return false;
        }
        return true;
      }

      plugins.sort(sort).forEach(function(plugin) {
        Engine.add(plugin);
      });

      engines = plugins;
      resolve();
    });
  });


  return Engine;
});
