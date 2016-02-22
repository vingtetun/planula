/**
 * popuphelper.js
 *
 * Implements the necessary piece of code to open popups on the screen.
 *
 */
define(['popup'], function() {
  'use strict';

  const Types = {
    Window: 0,
    ContextMenu: 1,
    Popup: 2,
    Tooltip: 3
  };

  const Errors = {
    NoParameters: 'No parameters',
    NoURL: 'Needs a target url',
    NoTarget: 'Needs a target',
    NoIdentifier: 'Needs an identifier',
    UnknowType: 'Unknow type'
  };

  function ErrorMessage(str) {
    dump('Error: ' + (new Error()).stack + '\n');
    dump('PopupHelper: ' + str + '\n');
    throw new Error('PopupHelper: ' + str);
  }

  function openPopup(options) {
    if (!options.usemargins) {
      options.usemargins = true;
    }

    var popup = openWindow(options);
    popup.classList.add('popup');
    return popup;
  }

  function openContextMenu(options) {
    var contextmenu = openWindow(options);
    contextmenu.classList.add('contextmenu');
    return contextmenu;
  }

  function openWindow(options) {
    var popup = null;
    if (options.name) {
      popup = document.querySelector('[name="' + options.name + '"]');
    }

    if (!popup) {
      popup = document.createElement('popup-element');
      popup.setAttribute('id', options.id);
      popup.setAttribute('autofocus', options.autofocus || false);
      popup.setAttribute('name', options.name);
      popup.classList.add('window');
      document.body.appendChild(popup);
      popup.setLocation(options.url);
    }

    if (options.anchor) {
      let anchorRect = options.anchor;
      popup.attachTo(options.anchor,
                     options.type === Types.Popup,
                     options.constraints);
    }

    if (options.data) {
      popup.forward(options.data);
    }

    if (options.usemargins && !popup.hasAttribute('usemargins')) {
      popup.setAttribute('usemargins', 'true');
    } else if (popup.hasAttribute('usemargins')) {
      popup.removeAttribute('usemargins');
    }

    return popup;
  }

  var PopupHelper = {
    openOverLink: function(options) {
      let target = document.getElementById(options.id);
      if (!target) {
        target = document.createElement('div');
        target.id = options.id;
        document.body.appendChild(target);
      }

      target.textContent = options.url;
    },

    openTooltip: function(options) {
      let target = document.getElementById(options.id);
      if (!target) {
        target = document.createElement('div');
        target.id = options.id;
        document.body.appendChild(target);
      }

      // Add some offsets
      target.style.top = options.y + 15 + 'px';
      target.style.left = options.x + 15 + 'px';

      target.textContent = options.tooltip;
    },

    openSelect: function(options) {
      if (!options.id) {
        options.id = 'select';
      }
      options.type = Types.ContextMenu;
      options.url = 'select/';
      this.open(options);
    },

    openContextMenu: function(options) {
      if (!options.id) {
        options.id = 'contextmenu';
      }
      options.type = Types.ContextMenu;
      options.url = 'contextmenu/';
      this.open(options);
    },

    openPopup: function(options) {
      options.type = Types.Popup;
      this.open(options);
    },

    openPanel: function(options) {
      options.type = Types.Panel;
      this.open(options);
    },

    open: function(options) {
      if (!options) {
        return ErrorMessage(Errors.NoParameters);
      }

      if (!options.url) {
        return ErrorMessage(Errors.NoURL);
      }

      if (!options.name) {
        options.name = '';
      }

      if (!options.type) {
        options.type = Types.Window;
      }

      switch (options.type) {
        case Types.Window:
          return openWindow(options);

        case Types.ContextMenu:
          return openContextMenu(options);

        case Types.Popup:
          return openPopup(options);

        default:
          return ErrorMessage(Errors.UnknowType + ' (' + options.type + ')');
      }

      return null;
    },

    close: function(options) {
      if (!options.id) {
        return ErrorMessage(Errors.NoIdentifier);
      }

      let target = document.getElementById(options.id);
      if (!target) {
        return ErrorMessage(Errors.NoTarget + ' for id:' + options.id);
      }

      this.service.broadcast('popuphidden', {id: target.id});
      target.remove();
    },

    update: function(options) {
      if (!options.id) {
        return ErrorMessage(Errors.NoIdentifier);
      }

      let target = document.getElementById(options.id);
      if (!target) {
        return ErrorMessage(Errors.NoTarget);
      }

      if (options.anchor) {
        target.anchor = options.anchor;
        target.move();
      }

      if (options.data) {
        target.forward(options.data);
      }
    }
  };

  for (let type in Types) {
    PopupHelper[type] = Types[type];
  }

  PopupHelper.service = Services.service('popups');
  return PopupHelper;
});
