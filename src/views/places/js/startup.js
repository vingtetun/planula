require.config({
  scriptType: 'text/javascript;version=1.8'
});

let buffer = [];

function storeValueForLater(e) {
  buffer.push(e.data);
};

window.addEventListener('message', storeValueForLater);

require([
  'main',
  'engine-ui'
], function() {
  window.removeEventListener('message', storeValueForLater);

  let data;
  while (data = buffer.shift()) {
    let event = new CustomEvent('buffer', {detail: { data: data } });
    window.dispatchEvent(event);
  }
});
