import log from 'electron-log';
import { createPinia } from 'pinia';
import { createApp, h } from 'vue';

import { createSyncPlugin } from '../shared/plugins';
import { useUserStore } from '../shared/store';

import { transfer } from './plugins';

export function createStore() {
  const app = createApp(h('div'));
  const store = createPinia();

  const syncPlugin = createSyncPlugin(transfer);
  store.use(syncPlugin);

  app.use(store);

  const stores = Object.fromEntries([
    useUserStore(store),
  ].map((item) => [item.$id, item]));

  return {
    store,
    stores,
  };
}

export async function saveStoreToLocal() {
  log.scope('app').info('Saving state before quitting...');

  await transfer.flush();

  log.scope('app').info('State saved, quitting...');
}

export type Stores = ReturnType<typeof createStore>['stores'];
