<template>
  <div class="message-list-container" ref="messageContainerRef">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item"
      :class="message.isMe ? 'my-message' : 'other-message'"
    >
      <!-- <div class="avatar-placeholder" v-if="!message.isMe">
         {{ message.senderName ? message.senderName.substring(0,1) : (message.sender ? message.sender.substring(0,1) : '?') }}
    </div> -->

      <div class="message-content-wrapper">
        <!-- <div class="sender-name" v-if="!message.isMe /* && isGroupProp */">
          {{ message.senderName || `${message.sender}` }}
        </div> -->
        <div class="message-bubble">
          <p class="message-content" v-if="message.contentType === 1 || !message.contentType">
            {{ message.content }}
          </p>
          <template v-else-if="message.contentType === 2 && message.content">
            <a
              :href="`${FILE_BASE_URL}${message.content}`"
              :download="message.fileName"
              target="_blank"
              rel="noopener noreferrer"
              class="file-message-link"
            >
              <span class="file-icon">📄</span>
              <div class="file-details">
                <span class="file-name">{{ message.content }}</span>
                <span v-if="message.fileSize" class="file-size"
                  >({{ formatFileSize(message.fileSize) }})</span
                >
              </div>
            </a>
          </template>

          <!-- <template v-else-if="message.contentType === 2">
  <div style="border: 1px solid red; padding: 5px;">
    文件调试信息:<br/>
    类型 (contentType): {{ message.contentType }} <br/>
    文件名 (fileName): {{ message.fileName || '[空或未定义]' }} <br/>
    </div>
</template> -->

          <template v-else-if="message.contentType === 2 && !message.content">
            <span class="file-error">[文件信息错误]</span>
          </template>
        </div>
        <span class="message-time">{{ formatDisplayTime(message.time) }}</span>
      </div>

      <!-- <div class="message-bubble">
        <p class="message-content">{{ message.content }}</p>
      </div>
      <span class="message-time">{{ message.time }}</span>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, nextTick, onMounted, type PropType } from 'vue'
import { type Message } from '@/stores/chat'

const FILE_BASE_URL = 'http://localhost:8080/file/'

// 假设 Message 类型已在全局或 types 文件中定义并导出
// 如果没有，需要在此处或全局定义

const props = defineProps({
  messages: {
    type: Array as PropType<Message[]>,
    required: true,
  },
  // 可以添加一个 prop 判断是否为群聊，用于显示 sender name
  // isGroup: { type: Boolean, default: false }
})

const messageContainerRef = ref<HTMLDivElement | null>(null)

// 滚动到底部的函数
const scrollToBottom = async () => {
  await nextTick() // 等待 DOM 更新完成
  const container = messageContainerRef.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const formatDisplayTime = (timeStr: string | undefined): string => {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (e) {
    return timeStr
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  if (i < 0) return '0 Bytes' // 处理非常小的数字或负数（虽然不应该发生）
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 监听消息数组变化，自动滚动到底部
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
) // deep: true 确保数组内部变化也能监听到

// 组件挂载后也滚动到底部
onMounted(() => {
  scrollToBottom()
})
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

.my-message .message-time {
  left: 8px;
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

.file-message-link {
  display: flex; /* 使用 flex 布局让图标和文字对齐 */
  align-items: center;
  padding: 8px 12px;
  background-color: #ffffff; /* 文件消息背景色 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none; /* 去掉下划线 */
  color: inherit; /* 继承文字颜色 */
  cursor: pointer;
  max-width: 250px; /* 限制最大宽度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.file-message-link:hover {
  background-color: #f9f9f9; /* 悬停时背景变色 */
}

.file-icon {
  font-size: 24px; /* 图标大小 */
  margin-right: 10px;
  flex-shrink: 0; /* 防止图标被压缩 */
  color: #777; /* 图标颜色 */
}

.file-details {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止文字溢出容器 */
  white-space: nowrap; /* 防止文字换行 */
}

.file-name {
  font-weight: 500;
  text-overflow: ellipsis; /* 用省略号显示过长文件名 */
  overflow: hidden;
}

.file-size {
  font-size: 0.8em;
  color: #888;
  margin-top: 2px;
}
</style>
