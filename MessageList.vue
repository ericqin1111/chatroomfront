<template>
  <div class="message-list">
    <div v-for="msg in messages" :key="msg.messageId" class="message">
      <div class="message-header">
        <span class="sender">{{ getSenderName(msg.senderId) }}</span>
        <span class="time">{{ formatTime(msg.sentTime) }}</span>
      </div>
      <div class="message-content">
        <template v-if="msg.contentType === 1">
          {{ msg.content }}
        </template>
        <template v-else-if="msg.contentType === 2">
          <img 
            v-if="isImage(msg.content)"
            :src="`http://localhost:8080/file/${msg.content}`" 
            style="max-width: 300px;"
          />
          <a v-else :href="`http://localhost:8080/file/${msg.content}`" download>
            下载文件: {{ msg.content }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

interface Props {
  type: 'friend' | 'group';
  target: string;
}
const props = defineProps<Props>();

// 从依赖注入获取消息数据（需父组件 provide）
const messageMap = inject<Record<string, any[]>>('messageMap')!;
const currentUserId = inject<string>('currentUserId')!;

const messages = computed(() => {
  const key = `${props.type}-${props.target}`;
  return messageMap[key] || [];
});

const getSenderName = (senderId: string) => {
  return senderId === currentUserId ? '我' : `用户 ${senderId}`;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const isImage = (fileName: string) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
};
</script>

<style scoped>
/* 原有样式保留 */
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}
.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #666;
}
</style>