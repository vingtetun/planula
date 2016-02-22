
(function startFrameTiming() {
  'use strict';

  function showTimeToLoad() {
    let container = document.createElement('div');

    let style = `
      position: absolute;
      top: 0;
      left: 0;
      padding: 0.2rem;
      background-color: rgba(255,0,0,0.5);
      z-index: 2147483647;
      font-family: Sans-Serif;
      font-size: 1rem;`;

    container.setAttribute('style', style);

    let start = Date.now();
    let interval = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(interval);
      }

      if (!container.parentNode && document.body) {
        document.body.appendChild(container);
      }

      container.textContent = (Date.now() - start) + ' ms';
    }, 1);
  }

  function showTimeToPaint() {
    let container = document.createElement('div');

    let style = `
      position: absolute;
      top: 0;
      left: 5rem;
      padding: 0.2rem;
      background-color: rgba(0,255,0,0.5);
      z-index: 2147483647;
      font-family: Sans-Serif;
      font-size: 1rem;`;
    container.setAttribute('style', style);

    let timeout = null;
    let lastPaintTime = 0;
    let start = Date.now();
    addEventListener('MozAfterPaint', function onAfterPaint() {
      timeout && clearTimeout(timeout);
      timeout = null;

      lastPaintTime = Date.now();
      timeout = setTimeout(() => {
        removeEventListener('MozAfterPaint', onAfterPaint);
        container.textContent = (lastPaintTime - start) + ' ms';
        document.body.appendChild(container);
      }, 10000);
    });
  }

  // run timers
  showTimeToLoad();
  showTimeToPaint();
})();
