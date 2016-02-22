// Detect Operating System

if (navigator.appVersion.indexOf('Win') >= 0) {
  self.OS = 'windows';
  self.document && self.document.body.setAttribute('os', 'windows');
}

if (navigator.appVersion.indexOf('Mac') >= 0) {
  self.OS = 'osx';
  self.document && self.document.body.setAttribute('os', 'osx');
}

if (navigator.appVersion.indexOf('X11') >= 0) {
  self.OS = 'linux';
  self.document && self.document.body.setAttribute('os', 'linux');
}

