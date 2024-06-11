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

  // Use all store to trigger the sync plugin
  useUserStore(store);

  return {
    store,
    transfer,
  };
}
