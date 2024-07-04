<template>
  <div>
    <label>
      Enter Your Name:
      <input
        v-model="username"
        class="border"
        type="text"
      >
    </label>

    <h1 class="font-bold text-lg">
      Hello {{ username }}
    </h1>
  </div>
</template>

<script setup lang="ts">
import '../store';

import { useVModel } from '@nanostores/vue';

import { userStore } from '@/shared/store';

const username = useVModel(userStore.$user, 'name');
</script>
