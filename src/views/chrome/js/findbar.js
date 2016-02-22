
define([], function() {
  'use strict';

  let placeholder = document.querySelector('.findbar');
  let urlinput = placeholder.querySelector('input');

  let commands = {
    value: null,
    direction: 1
  };

  urlinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      SearchInputValidated()
    }

    if (e.keyCode == 27) {
      SearchClose();
    }
  });

  let next = placeholder.querySelector('button.next');
  next.addEventListener('click', e => {
    commands.direction = 1;
    Services.browsers.method('findForward');
    urlinput.focus();
  });

  let prev = placeholder.querySelector('button.previous');
  prev.addEventListener('click', e => {
    commands.direction = -1;
    Services.browsers.method('findBackward')
    urlinput.focus();
  });

  let close = placeholder.querySelector('button.close');
  close.addEventListener('click', (e) => {
    SearchClose();
  });

  function SearchClose() {
    placeholder.classList.remove('visible');
    commands.direction = 1;
    urlinput.value = commands.value = '';
    urlinput.blur();
    Services.browsers.method('clearMatch');
  }

  function SearchInputValidated() {
    if (commands.value === urlinput.value) {
      if (commands.direction === -1) {
        Services.browsers.method('findBackward')
      } else {
        Services.browsers.method('findForward')
      }
    } else {
      commands.value = urlinput.value;
      Services.browsers.method('findAll', urlinput.value);
    }
  }

  Services.service('find')
    .method('open', () => {
      placeholder.classList.add('visible');
      urlinput.focus();
      urlinput.select();
    })
    .listen(new BroadcastChannel('find'));
});
