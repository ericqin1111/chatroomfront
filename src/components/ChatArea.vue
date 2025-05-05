<script setup lang="ts">
import { computed, watch } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
// 导入 Store 和需要的类型
import { useChatStore, type Chat, type Message } from '@/stores/chat';
// 导入 Auth Store 以获取当前用户 ID
import { useAuthStore } from '@/stores/auth';

// 获取 Store 实例
const chatStore = useChatStore();
const authStore = useAuthStore(); // 获取 Auth Store

// 从 Store 获取当前聊天信息
const currentChat = computed(() => chatStore.currentChat);
// 获取当前用户 ID (用于设置发送者)
const currentUserId = computed(() => authStore.userId);

// 调试日志 (可选)
watch(currentChat, (newVal: Chat | null) => {
    console.log('ChatArea: Watched currentChat changed:', newVal);
}, { immediate: true });

const activeChatId = computed(() => chatStore.activeChatId);
watch(activeChatId, (newId, oldId) => {
  // 当 activeChatId 变化且不为 null 时
  if (newId !== null && newId !== oldId) {
    // 尝试从 store 获取新选中的聊天数据
    const chat = chatStore.chats[newId];
    if (chat) {
      // 检查本地是否已有消息，或者是否需要强制刷新
      // 简化逻辑：如果 messages 数组为空，则调用 action 加载
      if (!chat.messages || chat.messages.length === 0) {
         console.log(`ChatArea: Active chat ID changed to ${newId}, fetching messages...`);
         // 调用 Pinia Action 获取该聊天的消息历史
         // fetchMessages action 内部会使用 currentUserId
         chatStore.fetchMessages(newId);
      } else {
          console.log(`ChatArea: Chat ID ${newId} already has messages locally.`);
          // 如果需要每次切换都刷新，可以在这里也调用 fetchMessages
          // 或者，如果 MessageList 实现了滚动加载更多，这里就不需要做什么
      }
    } else {
        // 这种情况可能发生在 fetchChatList 慢于 setActiveChatId 时
        console.warn(`ChatArea: Chat data for ID ${newId} not found in store immediately after activation. Waiting for fetchChatList?`);
        // 也可以在这里尝试调用一次 fetchMessages，让 action 内部处理 chat 不存在的情况
        // chatStore.fetchMessages(newId);
    }
  }
}, { immediate: true });

// 处理发送消息的函数 (修改后)
const handleSendMessage = (content: string) => {
  // 1. 检查当前是否有选中的聊天
  if (!currentChat.value) {
      console.error("无法发送消息：未选择聊天。");
      return;
  }
  // 2. 检查 WebSocket 连接状态 (通过 Store getter)
  if (!chatStore.isWsConnected) {
      console.error("无法发送消息：WebSocket 未连接。");
      // 可以给用户提示，例如使用 Element Plus 的 Message
      // ElMessage.error('连接已断开，无法发送消息');
      return;
  }

  // 3. 获取目标 ID 和类型
  const targetId = currentChat.value.id;
  const chatType = currentChat.value.type; // **确保 Chat 类型中有 type 字段**

  // 4. 创建要在本地立即显示的消息对象
  const newMessage: Message = {
    id: `local-${Date.now()}`, // 本地临时唯一 ID
    sender: currentUserId.value?.toString() || '我', // 设置发送者为当前用户
    content: content,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: true, // 标记为自己发送
    contentType: 1, // 文本类型
  };

  // 5. **立即将消息添加到本地 Store**，以便 UI 快速反馈
  chatStore.addMessageToActiveChat(newMessage);

  // 6. **调用 Store Action，通过 WebSocket 发送消息到后端**
  console.log(`准备发送消息到 ${chatType} ${targetId}`);
  if (chatType === 'friend') { // 注意：你的 Chat 接口 type 是 'friend' 还是 'private'？这里用了 'private'
    chatStore.sendMessageToFriend(targetId, content);
  } else if (chatType === 'group') {
    chatStore.sendMessageToGroup(targetId, content);
  } else {
    console.error("无法发送消息：未知的聊天类型:", chatType);
    // 理论上不应该发生，除非数据有问题
    // 可选：如果发送失败，是否要从本地移除刚刚添加的消息？（逻辑会变复杂）
  }
};

// setup 默认会暴露所有顶层绑定给模板，所以不需要显式 return
// （除非你需要 <script setup> 和 Options API 混用，但不推荐）
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'ChatArea' });
</script>

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