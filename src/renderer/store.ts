import { setPersistentEngine } from '@nanostores/persistent';

import { createPersistentEngine } from '@/shared/utils';

import type { PersistentListener, PersistentPayload } from '@/shared/utils/persistent';

const localPrefix = '__local__:';

let listener: PersistentListener;
const update = (payload: PersistentPayload) => listener?.(payload);

const { store, events } = createPersistentEngine({
  get: (key: string) => {
    const localKey = `${localPrefix}${key}`;

    if (typeof window === 'undefined') {
      return undefined;
    }

    const localValue = localStorage.getItem(localKey);

    if (localValue !== null) {
      return JSON.parse(localValue);
    }

    if ('electron' in window) {
      // Get state value from main process
      return window.electron.sendSync('store:read', { key });
    }

    return undefined;
  },
  send: (payload: PersistentPayload) => {
    const localKey = `${localPrefix}${payload.key}`;

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(localKey, JSON.stringify(payload.newValue));

    if ('electron' in window) {
      // Send state update to main process
      window.electron.send('store:update', payload);
    }
  },
  subscribe: (onUpdate: PersistentListener) => {
    listener = onUpdate;
  },
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (!event.key?.startsWith(localPrefix) || event.newValue === null) {
      return;
    }

    const key = event.key.slice(localPrefix.length);
    const newValue = JSON.parse(event.newValue);

    update({
      key,
      newValue,
    });
  });

  if ('electron' in window) {
    window.electron.on('store:update', update);
  }
}

setPersistentEngine(store, events);
