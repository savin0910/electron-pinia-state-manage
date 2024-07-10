<template>
  <button
    class="px-3 border border-gray-300 rounded hover:bg-gray-100"
    @click="openModal"
  >
    <slot>Open Modal</slot>
  </button>
</template>

<script setup lang="ts">
const openModal = async () => {
  const response = await window.electron.invoke('modal:show', {
    width: 400,
    title: 'Modal Title',
    message: 'Modal Message',
    buttons: ['OK', 'Cancel'],
  });

  console.log(response);
};
</script>
