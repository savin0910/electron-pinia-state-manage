import path from 'node:path';

import { utilityProcess, type UtilityProcess } from 'electron';
import log from 'electron-log';

let nuxtServer: UtilityProcess;

export function startNuxtServer() {
  return new Promise((resolve) => {
    const rootDir = path.join(__dirname, './nuxt');
    const serverPath = path.join(rootDir, 'server/index.mjs');

    log.scope('nuxt').info(`Nuxt server path: ${serverPath}`);

    nuxtServer = utilityProcess.fork(serverPath);

    nuxtServer.on('spawn', () => {
      resolve(nuxtServer);
    });

    nuxtServer.on('exit', (code) => {
      log.scope('nuxt').info('Nuxt server exited:', code);
    });
  });
}

export function stopNuxtServer() {
  nuxtServer?.kill();
}
