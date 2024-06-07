import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export type UserStoreState = {
  user: Ref<string>;
};

export const useUserStore = defineStore<'user', UserStoreState>('user', () => {
  const user = ref('');

  return {
    user,
  };
});
