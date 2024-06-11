import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export type UserStoreState = {
  name: Ref<string>;
};

export const useUserStore = defineStore<'user', UserStoreState>('user', () => {
  const name = ref('');

  return {
    name,
  };
});
