'use strict';

importScripts('shared/js/sww/dist/sww.js');

var worker = new self.ServiceWorkerWare();
worker.use(new self.SimpleOfflineCache());
worker.init();
