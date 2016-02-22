

define([
  '/src/shared/js/urlhelper.js',
  'engine-ui',
], function(UrlHelper, Engine) {

function parseMessage(e) {
  let data = e.detail ? e.detail.data : e.data;
  Engine.ready.then(() => {
    if ('value' in data) {
      showResults(data.value);
    } else if ('keycode' in data) {
      navigateResults(data.keycode);

      let validate = data.keycode === 13;
      var currentSelected = results.childNodes[_current];
      Services.urlbar.method('navigate', {
        url: validate ? currentSelected.url : currentSelected.display,
        load: validate
      });
    }
  });
}

function handleClick(e) {
  let target = e.target;
  Services.urlbar.method('navigate', {
    url: target.url,
    load: true
  });
}

window.addEventListener('message', parseMessage);
window.addEventListener('buffer', parseMessage);
window.addEventListener('click', handleClick);


function navigateResults(keycode) {
  switch (keycode) {
    case 38:
      selectPrevious();
      break;

    case 40:
      selectNext();
      break;
  }
}

var _current = 0;
function selectPrevious() {
  var currentSelected = results.childNodes[_current];
  if (_current <= 0) {
    return;
  }

  currentSelected.removeAttribute('selected');
  results.childNodes[--_current].setAttribute('selected', 'true');
}

function selectNext() {
  var currentSelected = results.childNodes[_current];
  if (_current >= results.childNodes.length - 1) {
    return;
  }

  currentSelected.removeAttribute('selected');
  results.childNodes[++_current].setAttribute('selected', 'true');
}

function processValue(value) {
  let rv = {
    shortcut: null,
    value: value,
    useSearchEngine: true
  };

  if (UrlHelper.isURL(value)) {
    if (UrlHelper.hasScheme(value)) {
      rv.value = value;
    } else {
      rv.value = 'http://' + value;
    }
    rv.url = rv.value;
    rv.useSearchEngine = false;
  } else if (value.length >= 3 && value[1] == ' ') {
    let values = value.split(' ');
    rv.shortcut = values.shift();
    rv.value = values.join(' ');
  } else {
    rv.value = value;
  }

  return rv;
}

function showResults(value) {
  let results = document.getElementById('results');

  let infos = processValue(value);

  if (infos.shortcut) {
    Engine.selectWithShortcut(infos.shortcut);
  }

  if (infos.useSearchEngine) {
    let metadata = Engine.getMetadata(infos.value);
    infos.url = metadata.navigation;
    infos.description = metadata.description;
    infos.suggestions = metadata.suggestions;
  } else {
    infos.description = '';
    infos.suggestions = '';
  }

  if (infos.value === '') {
    return;
  }
  
  let promises = [Services.history.method('getMatches', infos.value)];
  if (infos.useSearchEngine && infos.suggestions) {
    promises.push(Services.suggestions.method('get', infos.suggestions));
  }

  Promise.all(promises).then(([histories, suggestions]) => {
    results.innerHTML = '';
    createElement(infos.value, infos.url, infos.description, infos.useSearchEngine ? 'suggestion' : 'url');

    let historyCount = 5;
    for (let i = 0; i < Math.min(histories.length, historyCount); i++) {
      createElement(histories[i].url, histories[i].url, histories[i].title, 'history');
    }

    if (suggestions) {
      let suggestionsCount = Math.min(6 - results.childNodes.length, 3);
      for (let i = 0; i < Math.min(suggestions.length, suggestionsCount); i++) {

        let rv = Engine.getMetadata(suggestions[i]);
        createElement(suggestions[i], rv.navigation, rv.description, 'suggestion');
      }
    }

    _current = 0;
    results.childNodes[0].setAttribute('selected', 'true');
  });
}

function createElement(value, url, title, type) {
  var element = document.createElement('li');
  element.className = 'result ' + type;
  element.display = value;
  element.url = url;

  var text = document.createElement('span');
  text.className = 'text';
  text.textContent = value;
  element.appendChild(text);

  if (title) {
    var text2 = document.createElement('span');
    text2.className = 'title';
    text2.textContent = ' - ' + title;
    element.appendChild(text2);
  }

  var results = document.getElementById('results');
  results.appendChild(element);

  return element;
}

});
