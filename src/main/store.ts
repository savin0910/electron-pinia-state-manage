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

  // Init all store
  useUserStore(store);

  return {
    store,
    transfer,
  };
}
