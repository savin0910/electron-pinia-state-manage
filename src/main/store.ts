import { ipcMain } from 'electron';

import { createPinia } from 'pinia';
import { createApp, h } from 'vue';

import { createSyncPlugin } from '../shared/plugins';
import { useUserStore } from '../shared/store';

import { createPiniaTransferMain } from './plugins';

export function createStore() {
  const app = createApp(h('div'));
  const store = createPinia();

  const transfer = createPiniaTransferMain();
  const syncPlugin = createSyncPlugin(transfer);
  store.use(syncPlugin);

  app.use(store);

  // Init all store
  useUserStore(store);

  // Handle updates from the renderer process
  ipcMain.on('pinia:update', (_, { id, state }: {
    id: string;
    state: any;
  }) => {
    transfer.onUpdate?.(id, state);
  });

  ipcMain.handle('pinia:read', async (_, id: string) => transfer.getState?.(id));

  return {
    store,
    transfer,
  };
}
