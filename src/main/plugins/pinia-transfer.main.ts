import fs from 'node:fs/promises';
import path from 'node:path';

import { app, ipcMain, webContents } from 'electron';
import log from 'electron-log';

import { exists } from '../utils';

import type { PiniaTransfer } from '@/shared/plugins';
import type { WebContents } from 'electron';
import type { StateTree } from 'pinia';

export type PiniaTransferMain = PiniaTransfer & {
  flush: () => Promise<void>;
  start: (interval?: number) => void;
  stop: () => void;
};

const localFile = path.join(app.getPath('userData'), 'pinia-state.json');
const readLocalFile = async () => {
  if (!await exists(localFile)) {
    // Skip if the file does not exist
    return null;
  }

  try {
    const text = await fs.readFile(localFile, 'utf-8');
    const json = JSON.parse(text);

    return json;
  } catch (error) {
    log.scope('pinia-transfer-main').error('Failed to read state:', error);

    return null;
  }
};

let timer: NodeJS.Timeout;

const dirtyStores = new Set<string>();
export const transfer: PiniaTransferMain = {
  // Read the state from transfer
  read: async (id: string) => {
    const data = await readLocalFile();

    return data?.[id];
  },
  // Write updated state to transfer
  write: (id: string, state?: StateTree) => {
    // Record the store which has been updated
    dirtyStores.add(id);

    webContents.getAllWebContents().forEach((contents: WebContents) => {
      if (!contents.isDestroyed()) {
        // Send the state to the renderer process
        contents.send('pinia:update', { id, state });
      }
    });
  },
  // Flush the state to disk, it can be called by other logic when needed
  flush: async () => {
    if (dirtyStores.size === 0) {
      // Skip if nothing has changed
      return;
    }

    const data = (await readLocalFile()) || {};

    // Overwrite local state with the latest state from the stores
    for await (const id of dirtyStores) {
      data[id] = {
        ...data[id],
        ...(await transfer.getState?.(id)),
      };
    }

    // Write fully updated state to disk
    try {
      await fs.writeFile(localFile, JSON.stringify(data), 'utf-8');

      // Clear cached store ids
      dirtyStores.clear();
    } catch (error) {
      log.scope('pinia-transfer-main').error('Failed to write state:', error);
    }
  },
  // Save the state every minute by default
  start: (interval = 60 * 1000) => {
    clearInterval(timer);

    timer = setInterval(transfer.flush, interval);
  },
  stop: () => {
    clearInterval(timer);
  },
};

// Clear timer before quit
app.on('will-quit', () => clearInterval(timer));

// Handle updates from the renderer process
ipcMain.on('pinia:update', ({ sender }, { id, state }: {
  id: string;
  state: StateTree;
}) => {
  // Record the store which has been updated
  dirtyStores.add(id);

  transfer.onUpdate?.(id, state);

  // Broadcast the update to all other renderer processes
  webContents.getAllWebContents().forEach((contents) => {
    if (contents !== sender && !contents.isDestroyed()) {
      // Send the state to the renderer process
      contents.send('pinia:update', { id, state });
    }
  });
});

ipcMain.handle('pinia:read', async (_, id: string) => transfer.getState?.(id));
