/**
 * tabstrip.js
 *
 * This code controls the UI of the tabs.
 * A tab is: a favicon, a title and the close button.
 * The web content is *not* handled here.
 *
 */


require([], function() {
  'use strict';

  // Tabs will be appended in there.
  let tabscontainer = document.getElementById('tabs');

  // Where will store the tab objects, with their linked
  // <tab-iframe>
  const allTabs = new Map();

  // Tab JS object. This should use web components.
  // issue #64
  function Tab(config={}) {
    let tab = document.createElement('div');
    tab.className = 'tab';
    tab.setAttribute('flex', '0');
    tab.setAttribute('align', 'center');

    let throbber = document.createElement('div');
    throbber.className = 'throbber';

    let favicon = document.createElement('img');
    favicon.className = 'favicon';

    let title = document.createElement('div');
    title.className = 'title';

    let button = document.createElement('button');
    button.className = 'close-button';
    button.title = 'Close Tab';

    button.onmouseup = (event) => {
      if (event.button == 0) {
        event.stopPropagation();
        Tabs.method('remove', config.uuid);
      }
    };

    tab.onmousedown = (event) => {
      if (event.button == 0) {
        Tabs.method('select', config.uuid);
      }
    };

    tab.onmouseup = (event) => {
      if (event.button == 1) {
        event.stopPropagation();
        Tabs.method('remove', config.uuid);
      }
    }

    tab.appendChild(throbber);
    tab.appendChild(favicon);
    tab.appendChild(title);
    tab.appendChild(button);

    this.config = config;
    this.dom = tab;

    this.client =
      bridge.client(config.uuid, new BroadcastChannel(config.uuid), 60000);

    this.client.on('update', (config) => {
      this.config = config;
      this.updateDom();
    });

    tabscontainer.appendChild(this.dom);
    this.updateDom();
  }

  Tab.prototype = {
    destroy: function() {
      this.config = null;
      this.dom.remove();
    },

    select: function() {
      this.dom.scrollIntoView(true);
      this.dom.classList.add('selected');
    },

    move: function(direction) {
      let dom = this.dom;

      if (direction === -1 && dom.previousSibling) {
        dom.parentNode.insertBefore(dom, dom.previousSibling);
      } else if (direction === 1 && dom.nextSibling) {
        dom.parentNode.insertBefore(dom, dom.nextSibling.nextSibling);
      }
    },

    unselect: function() {
      this.dom.classList.remove('selected');
    },

    updateDom: function() {
      if (this.config.loading) {
        this.dom.classList.add('loading');
      } else {
        this.dom.classList.remove('loading');
      }

      let title = this.config.title;
      if (!title) {
        if (this.config.url) {
          title = this.config.url;
        } else {
          title = 'New Tab';
        }
      }
      this.dom.querySelector('.title').textContent = title;
      this.dom.setAttribute('title', title);
      this.dom.title = title;

      let faviconImg = this.dom.querySelector('.favicon');
      if (this.config.favicon) {
        faviconImg.src = this.config.favicon;
      } else {
        faviconImg.removeAttribute('src');
      }
    },
  };

  var Tabs = Services.tabs;

  Tabs.on('move', (detail) => {
    let tab = allTabs.get(detail.uuid);
    if (tab) {
      tab.move(detail.direction);
    }
  });

  Tabs.on('add', (detail) => {
    let tab = new Tab(detail);
    allTabs.set(detail.uuid, tab);
  });

  Tabs.on('remove', (detail) => {
    let tab = allTabs.get(detail.uuid);
    if (tab) {
      tab.destroy();
      allTabs.delete(detail.uuid);
    }
  });

  Tabs.on('select', (detail) => {
    let tab = allTabs.get(detail.uuid);
    if (tab) {
      tab.select();
    }
  });

  Tabs.on('unselect', (detail) => {
    let tab = allTabs.get(detail.uuid);
    if (tab) {
      tab.unselect();
    }
  });

  /* Build curved tabs */

  let ready = (document.readyState === 'complete');
  if (ready) {
    BuildCurvedTabs();
  } else {
    addEventListener('load', onDocumentLoaded);
  }

  function onDocumentLoaded() {
    removeEventListener('load', onDocumentLoaded);
    BuildCurvedTabs();
  }

  function BuildCurvedTabs() {
    let curveDummyElt = document.querySelector('.dummy-tab-curve');
    let style = window.getComputedStyle(curveDummyElt);

    let curveBorder = style.getPropertyValue('--curve-border');
    let curveGradientStart = style.getPropertyValue('--curve-gradient-start');
    let curveGradientEnd = style.getPropertyValue('--curve-gradient-end');
    let curveHoverBorder = style.getPropertyValue('--curve-hover-border');
    let curveHoverGradientStart = style.getPropertyValue('--curve-hover-gradient-start');
    let curveHoverGradientEnd = style.getPropertyValue('--curve-hover-gradient-end');

    let c1 = document.createElement('canvas');
    c1.id = 'canvas-tab-selected';
    c1.hidden = true;
    c1.width = 3 * 28;
    c1.height = 28;
    drawBackgroundTab(c1, curveGradientStart, curveGradientEnd, curveBorder);
    document.body.appendChild(c1);

    let c2 = document.createElement('canvas');
    c2.id = 'canvas-tab-hover';
    c2.hidden = true;
    c2.width = 3 * 28;
    c2.height = 28;
    drawBackgroundTab(c2, curveHoverGradientStart, curveHoverGradientEnd, curveHoverBorder);
    document.body.appendChild(c2);


    function drawBackgroundTab(canvas, bg1, bg2, borderColor) {
      canvas.width = window.devicePixelRatio * canvas.width;
      canvas.height = window.devicePixelRatio * canvas.height;
      let ctx = canvas.getContext('2d');
      let r = canvas.height;
      ctx.save();
      ctx.beginPath();
      drawCurve(ctx, r);
      ctx.lineTo(3 * r, r);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.clip();

      // draw background
      let lingrad = ctx.createLinearGradient(0, 0, 0, r);
      lingrad.addColorStop(0, bg2);
      lingrad.addColorStop(1, bg2);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0, 0, 3 * r, r);

      // draw border
      ctx.restore();
      ctx.beginPath();
      drawCurve(ctx, r);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    function drawCurve(ctx, r) {
      let firstLine = 1 / window.devicePixelRatio;
      ctx.moveTo(r * 0, r * 0.984);
      ctx.bezierCurveTo(r * 0.27082458, r * 0.95840561,
                        r * 0.3853096, r * 0.81970962,
                        r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(r * 0.46819998, r * 0.3905,
                        r * 0.485, r * 0.0659,
                        r * 0.95,  firstLine);
      ctx.lineTo(r + r * 1.05, firstLine);
      ctx.bezierCurveTo(3 * r - r * 0.485, r * 0.0659,
                        3 * r - r * 0.46819998, r * 0.3905,
                        3 * r - r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(3 * r - r * 0.3853096, r * 0.81970962,
                        3 * r - r * 0.27082458, r * 0.95840561,
                        3 * r - r * 0, r * 0.984);
    }
  }

});
