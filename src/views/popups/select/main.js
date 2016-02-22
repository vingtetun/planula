
var targetURI = null;
var documentURI = null;

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


window.addEventListener('message', function(e) {
  var data = e.data;

  dumpObject(data);

  var element = document.querySelector('.selectmenu');
  element.style.left = (data.rect.left - window.mozInnerScreenX) + 'px';
  element.style.top = (data.rect.top + data.rect.height - window.mozInnerScreenY) + 'px';
  element.style.width = (data.rect.width) + 'px';
  element.style.visibility = 'visible';

  data.options.forEach(function(option) {
    createElement(option);
  });

});

function createElement(option) {
  let element = document.createElement('div');
  element.className = 'row';
  element.textContent = option.textContent;

  let container = document.querySelector('.selectmenu');
  container.appendChild(element);
}

addEventListener('click', function(e) {
  switch (e.target.id) {
    default:
      // XXX Do something....
      break;
  }
});
