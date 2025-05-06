<template>
  <div class="chat-layout-container">
    <AppSidebar />

    <ChatArea v-if="activeChatIdFromStore !== null" class="chat-area-main" />

    <div class="chat-area-placeholder" v-else>请从左侧选择一个聊天开始</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ChatArea from '@/components/ChatArea.vue'
import { useChatStore } from '@/stores/chat'

// 2. 获取 store 和 activeChatId
const chatStore = useChatStore()
const activeChatIdFromStore = computed(() => chatStore.activeChatId)
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ChatLayout',
})
</script>

<style scoped>
.chat-layout-container {
  display: flex;
  height: 100vh; /* 或者 100%, 取决于父级是否有高度 */

  /* --- 添加这些 --- */
  width: 100%; /* 让布局容器尝试撑满其父级(.app-container)给它的宽度 */
  max-width: 1400px; /* 设置一个最大宽度，防止在大屏幕上无限变宽 (值可以调整) */
  /* --- --- */

  /* 可选: 添加背景色和边框，方便调试时看清它的边界 */
  /* background-color: white; */
  /* border: 1px solid red; */
  /* box-shadow: 0 2px 10px rgba(0,0,0,0.1); */ /* 可选阴影 */
}
.chat-area-main {
  flex-grow: 1; /* 这个保持不变，让它吃掉 .chat-layout-container 内的剩余空间 */
  overflow: hidden; /* 防止 ChatArea 内部内容溢出影响布局 */
  /* border: 1px dashed blue; */ /* 可选调试边框 */
  display: flex; /* 通常 ChatArea 内部根元素已经是 flex column 了，这里可能不需要 */
}
.chat-area-placeholder {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 1.5em;
}
</style>
