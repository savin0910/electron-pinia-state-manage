import { createSyncPlugin } from '@/shared/plugins';

import type { PiniaTransfer } from '@/shared/plugins';
import type { Pinia, StateTree } from 'pinia';

export const transfer: PiniaTransfer = {
  read: async (id?: string) => {
    // Get state from main process
    let state;

    if (typeof window !== 'undefined') {
      state = await window?.electron.invoke('pinia:read', id) as StateTree | undefined;
    } else if (typeof stores !== 'undefined' && id) {
      state = stores[id];
    } else if (process?.parentPort) {
      state = await new Promise<StateTree | undefined>((resolve) => {
        const callback = ({ data }: any) => {
          if (data.type === 'pinia:read' && data.id === id) {
            process.parentPort.off('message', callback);

            console.log('Received state:', data.state);

            resolve(data.state);
          }
        };

        process.parentPort.postMessage({
          type: 'pinia:read',
          id,
        });

        process.parentPort.on('message', callback);
      });
    }

    return state;
  },
  write: (id: string, state: any) => {
    // Send state to the main process
    window.electron.send('pinia:update', { id, state });
  },
};

if (typeof window !== 'undefined') {
  // Handle updates from the main process
  window.electron.on('pinia:update', ({ id, state }) => {
    transfer.onUpdate?.(id, state);
  });
}

export default defineNuxtPlugin((context) => {
  (context.$pinia as Pinia).use(createSyncPlugin(transfer));
});
