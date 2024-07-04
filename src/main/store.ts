import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { setPersistentEngine } from '@nanostores/persistent';
import { app, ipcMain, webContents } from 'electron';

import { createPersistentEngine } from '@/shared/utils';

import type { PersistentPayload, PersistentListener } from '@/shared/utils';

const localFile = path.join(app.getPath('userData'), 'store.json');
const saveInterval = 2 * 60 * 1000;

let localStore: Record<string, any>;
let listener: PersistentListener;
let updated = false;

export const saveStoreToLocal = async () => {
  if (updated && localStore) {
    await writeFile(localFile, JSON.stringify(localStore, null, 2), 'utf-8');

    updated = false;
  }
};
const { store, events } = createPersistentEngine({
  get: (name: string) => {
    if (!localStore && fs.existsSync(localFile)) {
      localStore = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
    }

    return localStore?.[name];
  },
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

// Save store to local file every 2 minutes
setInterval(saveStoreToLocal, saveInterval);

setPersistentEngine(store, events);

ipcMain.on('store:update', (_, payload: PersistentPayload) => {
  listener?.(payload);
});

ipcMain.on('store:read', (event, { key }) => {
  event.returnValue = store[key];
});
