import { persistentMap } from '@nanostores/persistent';

const $user = persistentMap('user', {
  name: '',
});

export const userStore = {
  $user,
};
