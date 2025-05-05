<template>
  <div class="message-list-container" ref="messageContainerRef">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item"
      :class="message.isMe ? 'my-message' : 'other-message'"
    >

      <div class="message-bubble">
        <p class="message-content">{{ message.content }}</p>
      </div>
      <span class="message-time">{{ message.time }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, nextTick, onMounted, type PropType } from 'vue';

// 假设 Message 类型已在全局或 types 文件中定义并导出
// 如果没有，需要在此处或全局定义
interface Message { id: number | string; sender: string; content: string; time: string; isMe: boolean; }

const props = defineProps({
  messages: {
    type: Array as PropType<Message[]>,
    required: true,
  },
  // 可以添加一个 prop 判断是否为群聊，用于显示 sender name
  // isGroup: { type: Boolean, default: false }
});

const messageContainerRef = ref<HTMLDivElement | null>(null);

// 滚动到底部的函数
const scrollToBottom = async () => {
  await nextTick(); // 等待 DOM 更新完成
  const container = messageContainerRef.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// 监听消息数组变化，自动滚动到底部
watch(() => props.messages, () => {
  scrollToBottom();
}, { deep: true }); // deep: true 确保数组内部变化也能监听到

// 组件挂载后也滚动到底部
onMounted(() => {
  scrollToBottom();
});

</script>

<style scoped>


/* MessageList.vue <style scoped> */
.message-list-container {
   /* 可以移除或减少左右 padding，让 message-item 更宽 */
   /* padding: 0 5px; */
}
.message-item {
  display: flex;
  margin-bottom: 15px;
  width: 100%; /* 强制消息项占据列表全部宽度 */
}

.my-message {
  justify-content: flex-end; /* 内容（头像、气泡+时间）靠右 */
}

.other-message {
  justify-content: flex-start; /* 内容靠左 */
}

/* 头像占位符样式 (如果使用) */
/* .avatar-placeholder { ... } */

/* 可以包裹气泡和时间，方便控制 */
.message-content-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 75%; /* **调整这个百分比** 试试 80% 或 85%? */
}
.my-message .message-content-wrapper {
    align-items: flex-end;
}
.other-message .message-content-wrapper {
    align-items: flex-start;
}


.message-bubble {
  /* max-width: 100%; */ /* 让气泡宽度由 wrapper 控制 */
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.5;
  text-align: left; /* 确保文字在气泡内左对齐 */
  /* position: relative; */ /* 可能不需要了 */
}

.my-message .message-bubble {
  background-color: #dcf8c6;
  color: #000;
  border-bottom-right-radius: 4px;
}

.other-message .message-bubble {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ebebeb;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
  padding: 0 5px; /* 时间的轻微内边距 */
  /* text-align 由父 wrapper 的 align-items 控制 */
}
</style>