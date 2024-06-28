<template>
  <div>
    <label>
      Enter Your Name:
      <input
        v-model="userStore.name"
        class="border"
        type="text"
      >
    </label>

    <h1 class="font-bold text-lg">
      Hello {{ userStore.name }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/shared/store';

const userStore = useUserStore();
</script>
