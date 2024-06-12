import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { createSyncPlugin } from '@/shared/plugins';

import App from './app.vue';
import { transfer } from './plugins';

const app = createApp(App);

const store = createPinia();
const syncPlugin = createSyncPlugin(transfer);

store.use(syncPlugin);

app.use(store);
app.mount('#app');

// Handle updates from the main process
window.electron.on('pinia:update', ({ id, state }) => {
  transfer.onUpdate?.(id, state);
});
