
define([], function() {
  'use strict';

  let placeholder = document.querySelector('.findbar');
  let urlinput = placeholder.querySelector('input');

  urlinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      SearchInputValidated()
    }

    if (e.keyCode == 27) {
      SearchClose();
    }
  });

  let next = placeholder.querySelector('button.next');
  next.addEventListener('click', e => Services.browsers.method('findForward'));

  let prev = placeholder.querySelector('button.previous');
  prev.addEventListener('click', e => Services.browsers.method('findBackward'));

  let close = placeholder.querySelector('button.close');
  close.addEventListener('click', (e) => {
    SearchClose();
  });

  function SearchClose() {
    placeholder.classList.remove('visible');
    urlinput.value = '';
    urlinput.blur();
    Services.browsers.method('clearMatch');
  }

  function SearchInputValidated() {
    Services.browsers.method('findAll', urlinput.value);
  }

  Services.service('find')
    .method('open', () => {
      placeholder.classList.add('visible');
      urlinput.focus();
      urlinput.select();
    })
    .listen(new BroadcastChannel('find'));
});
