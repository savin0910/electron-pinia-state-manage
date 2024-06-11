import type { MaybePromise } from '../types';
import type { PiniaPluginContext, StateTree } from 'pinia';

export type SyncPluginTransfer = {
  read: (id: string) => MaybePromise<StateTree>;
  write: (id: string, state: StateTree) => MaybePromise<void>;

  // Will be set by the sync plugin
  onUpdate?: (id: string, state: StateTree) => void;
  getState?: (id: string) => MaybePromise<StateTree | undefined>;
};

export function createSyncPlugin(transfer: SyncPluginTransfer) {
  return async function syncPlugin({ store, options }: PiniaPluginContext) {
    const syncFlag = Symbol('sync-flag');
    const omitExcluded = (state: StateTree) => {
      const exclude = typeof options.sync === 'object' ? options.sync.exclude : undefined;

      if (Array.isArray(exclude)) {
        return Object.fromEntries(
          // Exclude properties from the state
          Object.entries(state).filter(([key]) => !exclude.includes(key)),
        );
      }

      return state;
    };
    const updateStore = (state: StateTree) => {
      if (state) {
        // Set the sync flag to prevent infinite loops
        store.$patch({
          // @ts-ignore
          [syncFlag]: true,
          ...omitExcluded(state),
        });
      }
    };
    const init = async () => {
      try {
        const state = await transfer.read(store.$id);

        updateStore(state);
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    };

    // Initialize the store
    init();

    // Subscribe to transfer updates
    transfer.onUpdate = (id: string, state: StateTree) => {
      if (id === store.$id) {
        updateStore(state);
      }
    };

    // Add a method to get the state
    transfer.getState = async (id: string) => {
      if (id === store.$id) {
        // State must be a plain object
        return { ...omitExcluded(store.$state) };
      }

      return null;
    };

    // Subscribe to store updates
    store.$subscribe((mutation, state) => {
      const { type, storeId } = mutation;

      if (type === 'patch object' && mutation.payload[syncFlag]) {
        // Skip if the store is being updated by the sync plugin
        return;
      }

      // State must be a plain object
      transfer.write(storeId, { ...state });
    });
  };
}
