<template>
  <div class="app-container">
    <AppSidebar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue';
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
}
</style>