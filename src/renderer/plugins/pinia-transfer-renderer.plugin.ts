import type { SyncPluginTransfer } from '../../shared/plugins/pinia-sync.plugin';
import type { StateTree } from 'pinia';

export const transfer: SyncPluginTransfer = {
  read: async (id?: string) => {
    // Get state from main process
    const state = await window.electron.invoke('pinia:read', id) as StateTree | undefined;

    return state;
  },
  write: (id: string, state: any) => {
    // Send state to the main process
    window.electron.send('pinia:update', { id, state });
  },
};

// Handle updates from the main process
window.electron.on('pinia:update', ({ id, state }) => {
  transfer.onUpdate?.(id, state);
});
