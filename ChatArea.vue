<template>
  <div class="chat-area">
    <div v-if="activeChat" class="chat-container">
      <RouterView /> <!-- 渲染 ChatPage -->
    </div>
    <div v-else class="empty-chat">
      <h3>选择聊天对象开始对话</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeChat = computed(() => {
  return route.params.type && route.params.id;
});
</script>

<style scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.empty-chat {
  display: grid;
  place-items: center;
  height: 100%;
  color: #999;
}
</style>