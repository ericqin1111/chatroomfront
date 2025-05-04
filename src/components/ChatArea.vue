<template>
  <div class="chat-area-wrapper" v-if="currentChat">
    <div class="chat-header">
      <div class="title">{{ currentChat.name }}</div>
      </div>

    <MessageList :messages="currentChat.messages" class="message-list-component" />

    <MessageInput @send-message="handleSendMessage" class="message-input-component"/>
  </div>

  <div class="chat-placeholder" v-else>
    请从左侧选择一个聊天开始
  </div>
</template>

<script setup lang="ts">
// <script setup> 部分保持之前的逻辑 (使用 Pinia store)
import { computed, watch } from 'vue';
import MessageList from './MessageList.vue'; // 导入子组件
import MessageInput from './MessageInput.vue';
import { useChatStore, type Chat, type Message } from '@/stores/chat'; // 导入类型

const chatStore = useChatStore();
const currentChat = computed(() => chatStore.currentChat);

watch(currentChat, (newVal: Chat | null) => {
    console.log('ChatArea: Watched currentChat changed:', newVal);
}, { immediate: true });

const handleSendMessage = (content: string) => {
    if (!currentChat.value) return;
    const newMessage: Message = {
      id: Date.now(), sender: '我', content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    chatStore.addMessageToActiveChat(newMessage);
    // 发送消息到后端...
};
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'ChatArea' });
</script>

<style scoped>
.chat-area-wrapper {
  flex-grow: 1; /* 垂直方向上如果需要可以伸展 */
  display: flex;
  flex-direction: column; /* 内部元素垂直排列 */
  height: 100%; /* 占据父级给的高度 */
  width: 100%;  /* ***** 添加这行 ***** 让它撑满父级给的宽度 */
  background-color: #f5f5f5;
  overflow: hidden; /* 防止内部滚动条影响布局 */
  box-sizing: border-box; /* padding 和 border 计算在宽高内 */
}

.chat-header {
  padding: 12px 20px; /* 调整内边距 */
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff; /* 头部背景色 */
  flex-shrink: 0; /* 不压缩头部 */
  z-index: 1; /* 可以在滚动时覆盖列表 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
}

.chat-header .title {
  font-weight: 600; /* 加粗 */
  font-size: 16px;
}

.message-list-component {
  flex-grow: 1; /* 让消息列表占据中间的主要空间 */
  overflow-y: auto; /* 当消息过多时，允许垂直滚动 */
  padding: 15px 20px; /* 消息列表的内边距 */
}

.message-input-component {
  flex-shrink: 0; /* 不压缩输入框 */
}

.chat-placeholder {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%; /* ***** 添加这行 ***** */
    color: #888;
    font-size: 1.5em;
}
</style>