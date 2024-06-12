import type { SyncPluginTransfer } from '@/shared/plugins';
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
