<!-- src/components/ChatLayout.vue -->
<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="chat-container">
    <AppSidebar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
}
</style>