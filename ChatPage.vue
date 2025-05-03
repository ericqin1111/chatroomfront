<template>
  <div class="chat-page">
    <div class="chat-header">
      <h2>{{ chatTitle }}</h2>
    </div>
    <MessageList :type="type" :target="target" />
    <MessageInput :type="type" :target="target" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MessageList from '@/components/MessageList.vue';
import MessageInput from '@/components/MessageInput.vue';

const route = useRoute();
const type = route.params.type as 'friend' | 'group';
const target = route.params.id as string;

const chatTitle = computed(() => {
  return type === 'friend' 
    ? `与好友 ${target} 的聊天` 
    : `群组 ${target} 的聊天`;
});
</script>

<style scoped>
/* 原有样式保留 */
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.chat-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
</style>