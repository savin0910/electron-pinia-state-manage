import path from 'node:path';

import { utilityProcess, type UtilityProcess } from 'electron';
import log from 'electron-log';

let nuxtServer: UtilityProcess | null = null;

export function startNuxtServer() {
  return new Promise((resolve) => {
    if (nuxtServer) {
      resolve(nuxtServer);
      return;
    }

    const rootDir = path.join(__dirname, './nuxt');
    const serverPath = path.join(rootDir, 'server/index.mjs');

    nuxtServer = utilityProcess.fork(serverPath, undefined, {
      serviceName: 'nuxt',
    });

    nuxtServer.on('spawn', () => {
      log.scope('nuxt').info('Nuxt server process id:', nuxtServer!.pid);

      resolve(nuxtServer);
    });

    nuxtServer.on('exit', (code) => {
      log.scope('nuxt').info('Nuxt server exited:', code);
    });
  });
}

export function stopNuxtServer() {
  if (nuxtServer) {
    nuxtServer.kill();

    nuxtServer = null;
  }
}
