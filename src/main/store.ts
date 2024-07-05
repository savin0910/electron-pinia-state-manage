import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { setPersistentEngine } from '@nanostores/persistent';
import { app, ipcMain, webContents } from 'electron';
import log from 'electron-log';

import { createPersistentEngine } from '@/shared/utils';

import type { PersistentPayload, PersistentListener } from '@/shared/utils';

const localFile = path.join(app.getPath('userData'), 'store.json');
const saveInterval = 2 * 60 * 1000;

let localStore: Record<string, any> = {};
let listener: PersistentListener;
let updated = false;

fs.readFile(localFile, 'utf-8', (error, data) => {
  if (!error) {
    try {
      localStore = JSON.parse(data);
    } catch {
      log.scope('store').warn('Failed to parse store.json');
    }
  }
});

const { store, events } = createPersistentEngine({
  initState: localStore,
  get: (name: string) => localStore[name],
  send: (payload: PersistentPayload) => {
    updated = true;

    webContents.getAllWebContents().forEach((webContent) => {
      if (!webContent.isDestroyed()) {
        webContent.send('store:update', payload);
      }
    });
  },
  subscribe: (onUpdate: PersistentListener) => {
    listener = onUpdate;
  },
});
export const saveStoreToLocal = async () => {
  if (updated) {
    await writeFile(localFile, JSON.stringify(store, null, 2), 'utf-8');

    updated = false;
  }
};

// Save store to local file every 2 minutes
setInterval(saveStoreToLocal, saveInterval);

setPersistentEngine(store, events);

ipcMain.on('store:update', (_, payload: PersistentPayload) => {
  updated = true;

  listener?.(payload);
});

ipcMain.on('store:read', (event, { key }) => {
  event.returnValue = store[key];
});
