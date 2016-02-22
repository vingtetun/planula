'use strict';

importScripts('src/shared/js/sww/dist/sww.js');

var worker = new self.ServiceWorkerWare();
worker.use(new self.SimpleOfflineCache());
worker.init();
