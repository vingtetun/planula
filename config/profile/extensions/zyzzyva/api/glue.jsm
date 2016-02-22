
Components.utils.import('resource://gre/modules/Services.jsm');

var EXPORTED_SYMBOLS = ['WindowUtils'];

var WindowUtils = {
  emit: function(name, action, options) {
    this.cloneInto(options).then(data => {
      this.getService(name).then(service => {
        service.method(action, data);
      });
    });
  },

  on: function(name, action, cb) {
    this.cloneFunction(cb).then(func => {
      this.getService(name).then(service => {
        service.on(action, func);
      });
    });
  },

  ready: function() {
    return this.getWindow().then(window => {
      return window.wrappedJSObject.Services.ready;
    });
  },

  getWindow: function() {
    let topWindow = Services.wm
                            .getMostRecentWindow('navigator:browser');
    if (topWindow) {
      let window = topWindow.frames[0];
      if (window && window.document.readyState === 'complete') {
        return Promise.resolve(window);
      }
    }
    return new Promise(done => {
      Services.tm.mainThread.dispatch(function() {
        done(WindowUtils.getWindow());
      }, Components.interfaces.nsIThread.DISPATCH_NORMAL);
    });
  },

  getService: function(name) {
    return this.getWindow().then(window => window.wrappedJSObject.Services[name]);
  },

  cloneFunction: function(obj) {
    return WindowUtils.getWindow().then(window => {
      return Components.utils.cloneInto(obj, window, {
        cloneFunctions: true
      });
    });
  },

  cloneInto: function(obj) {
    return WindowUtils.getWindow().then(window => {
      return Components.utils.cloneInto(obj, window);
    });
  },
};
