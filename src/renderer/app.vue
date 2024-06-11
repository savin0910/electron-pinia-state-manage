<template>
  <label>
    <span>Your name: </span>
    <input v-model="userStore.name" type="text" />
  </label>

  <p>Hello, {{ userStore.name }}</p>
</template>

<script setup lang="ts">
import { useUserStore } from '../shared/store';

const userStore = useUserStore();
</script>
