import { app, ipcMain, webContents } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

import log from 'electron-log';

import { exists } from '../utils';

import type { SyncPluginTransfer } from '../../shared/plugins/pinia-sync.plugin';
import type { WebContents } from 'electron';
import type { StateTree } from 'pinia';

export type PiniaTransferMainOptions = {
  saveInterval?: number;
};

export type PiniaTransferMain = SyncPluginTransfer & {
  flush: () => Promise<void>;
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

export function createPiniaTransferMain(options?: PiniaTransferMainOptions): PiniaTransferMain {
  // Save the state every minute by default
  const interval = options?.saveInterval ?? 60 * 1000;

  const dirtyStores = new Set<string>();
  const plugin: PiniaTransferMain = {
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
          ...(await plugin.getState?.(id)),
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
  };

  setInterval(plugin.flush, interval);

  // Handle updates from the renderer process
  ipcMain.on('pinia:update', (_, { id, state }: {
    id: string;
    state: any;
  }) => {
    // Record the store which has been updated
    dirtyStores.add(id);

    plugin.onUpdate?.(id, state);
  });

  ipcMain.handle('pinia:read', async (_, id: string) => plugin.getState?.(id));

  return plugin;
}
