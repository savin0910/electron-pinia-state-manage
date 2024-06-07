import type { PiniaPluginContext } from 'pinia';

const syncFlag = Symbol('sync-flag');

export function createSyncPlugin() {
  return async function syncPlugin({ store, options }: PiniaPluginContext) {
    if (typeof options?.sync === 'boolean' && options.sync) {
      // Subscribe to main process updates
      window.pinia.on((data: any) => {
        const { id, state } = data;

        if (id === store.$id) {
          store.$patch({
            [syncFlag]: true,
            ...state,
          });
        }
      });

      // Subscribe to store updates
      store.$subscribe((mutation, state) => {
        const { type, storeId } = mutation;

        if (type === 'patch object' && mutation.payload[syncFlag]) {
          // Skip if the store is being updated by the sync plugin
          return;
        }

        window.pinia.send(storeId, state);
      });
    }
  };
}
