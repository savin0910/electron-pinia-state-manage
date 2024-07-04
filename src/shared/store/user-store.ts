import { persistentMap } from '@nanostores/persistent';

const $user = persistentMap('user', {
  name: '123',
});

export const userStore = {
  $user,
};
