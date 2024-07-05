import type { PersistentEvent, PersistentEvents, PersistentStore } from '@nanostores/persistent';

export type PersistentPayload = PersistentEvent & {
  newValue: any;
};

export type PersistentListener = (payload: PersistentPayload) => void;

export type PersistentEngineOptions = {
  initState?: Record<string, any>;
  get?: (name: string) => any;
  send?: PersistentListener;
  subscribe?: (onUpdate: PersistentListener) => void;
};

export function createPersistentEngine({
  initState,
  get,
  send = () => {},
  subscribe,
}: PersistentEngineOptions) {
  const remotePrefix = '__remote__:';
  const listeners: Set<PersistentListener> = new Set();
  const onChange = (payload: PersistentPayload) => listeners.forEach((fn) => fn(payload));
  const store: PersistentStore = new Proxy({ ...initState }, {
    set(target: any, key: string, newValue: any) {
      if (key.startsWith(remotePrefix)) {
        // Remote update's key starts with prefix
        key = key.slice(remotePrefix.length);
      } else {
        // Send local update to remote
        send({
          key,
          newValue,
        });
      }

      // Update store value
      target[key] = newValue;

      // Trigger nanostores updates
      onChange({
        key,
        newValue,
      });

      return true;
    },
    get(target: any, name: string) {
      // Initialize store value
      if (!Reflect.has(target, name) && typeof get === 'function') {
        const value = get(name);

        if (value !== undefined) {
          Reflect.set(target, name, value);
        }
      }

      return target[name];
    },
    deleteProperty(target: any, key: string) {
      const payload: PersistentPayload = {
        key,
        newValue: undefined as any,
      };

      delete target[key];

      // Send update directly, Because delete operation only happens locally
      // Remote delete operation will send a update which newValue is undefined
      send(payload);

      onChange(payload);

      return true;
    },
  });
  const set = ({ key, newValue }: PersistentPayload) => {
    // Mark this update is from remote
    Reflect.set(store, `${remotePrefix}${key}`, newValue);
  };
  const events: PersistentEvents = {
    addEventListener(_, callback: PersistentListener, restore) {
      restore();
      listeners.add(callback);
    },
    removeEventListener(_, callback: PersistentListener) {
      listeners.delete(callback);
    },
    perKey: false,
  };

  if (typeof subscribe === 'function') {
    subscribe(set);
  }

  return {
    store,
    events,
  };
}
