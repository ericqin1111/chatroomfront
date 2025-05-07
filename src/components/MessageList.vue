<template>
  <div class="message-list-container" ref="messageContainerRef">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item"
      :class="message.isMe ? 'my-message' : 'other-message'"
    >
    <div class="avatar-placeholder" v-if="!message.isMe" >
    {{ message.senderName ? message.senderName.substring(0,1) : (message.sender ? message.sender.substring(0,1) : '?') }}
</div>

      <div class="message-content-wrapper">
        <div class="sender-name" v-if="!message.isMe /* && isGroupProp */">
          {{ message.senderName || `${message.sender}` }}
        </div> 
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
              <!-- <span class="file-icon">📄</span> -->

              <font-awesome-icon icon="file-alt" class="file-icon-fa" />
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

  chatName: {
    type: String,
    required: false, // 根据你的需要设置是否必须
    default: '聊天' // 可以设置一个默认值
  }
  
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

// 示例：在你的 <script setup> 中添加一个辅助函数
const TAHITI_COLORS = [
  '#FFC107', '#FF8A65', '#BA68C8', '#7986CB', '#4FC3F7',
  '#4DB6AC', '#AED581', '#FFD54F', '#A1887F', '#90A4AE'
];
// function getAvatarColor(userIdOrName: string | number): string {
//   let hash = 0;
//   const str = String(userIdOrName);
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     hash = hash & hash; // Convert to 32bit integer
//   }
//   const index = Math.abs(hash) % TAHITI_COLORS.length;
//   return TAHITI_COLORS[index];
// }
</script>

<style scoped>


   :global(:root) { /* 或者你的 app 根元素选择器，确保变量全局可用 */
  --chat-my-message-bg: #dcf8c6;
  --chat-other-message-bg: #ffffff;
  --chat-my-message-text-color: #000;
  --chat-other-message-text-color: #333;
  --chat-bubble-border-color: #ebebeb;
  --chat-bubble-border-radius: 18px;
  --chat-bubble-tail-radius: 4px; /* 用于气泡尾巴效果的圆角 */
  --chat-avatar-size: 40px;
  --chat-avatar-bg-default: #5bcf44; /* 头像默认背景色 */
  --chat-avatar-text-color: #ffffff; /* 头像内文字颜色，白色通常对比度好 */
  --chat-text-font-size: 14px;
  --chat-time-font-size: 11px;
  --chat-time-color: #aaa;
  --chat-file-bg: #f8f9fa; /* 文件消息背景 */
  --chat-file-border-color: #e0e0e0;
  --chat-file-icon-color: #6c757d;
  --chat-spacing-xs: 4px;
  --chat-spacing-sm: 8px;
  --chat-spacing-md: 10px;
  --chat-spacing-lg: 15px;
}

.message-list-container {
  /* padding: 0 var(--chat-spacing-xs); /* 稍微保留一点列表容器的左右边距 */
}

.message-item {
  display: flex;
  margin-bottom: var(--chat-spacing-lg);
  width: 100%;
}

.my-message {
  justify-content: flex-end; /* 整体内容（头像+消息体）靠右 */
  /* 如果头像在右边，消息体在左边，可以加上 flex-direction: row-reverse; */
}

.other-message {
  justify-content: flex-start; /* 整体内容靠左 */
}

.avatar-placeholder {
  width: var(--chat-avatar-size);
  height: var(--chat-avatar-size);
  border-radius: 50%;
  background-color: var(--chat-avatar-bg-default);
  color: var(--chat-avatar-text-color); /* 改为白色以获得更好对比度 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--chat-avatar-size) * 0.45); /* 根据头像大小动态调整字体大小 */
  font-weight: bold;
  overflow: hidden;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  flex-shrink: 0; /* 防止头像在 flex 布局中被压缩 */
}

/* 为头像和消息内容之间添加间距 */
.my-message .avatar-placeholder {
  /* 如果自己的消息也显示头像并且在右侧 */
  /* margin-left: var(--chat-spacing-md); */
}
.other-message .avatar-placeholder {
  margin-right: var(--chat-spacing-md);
}


.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 78%; /* 稍微调整，可以根据实际效果定 */
}

.my-message .message-content-wrapper {
  align-items: flex-end; /* 气泡和时间戳靠右 */
}

.other-message .message-content-wrapper {
  align-items: flex-start; /* 气泡和时间戳靠左 */
}

/* 你可以在这里添加 sender-name 的样式，如果取消注释并使用它 */
.sender-name {
  font-size: 12px;
  color: #666;
  margin-bottom: var(--chat-spacing-xs);
  padding-left: var(--chat-spacing-sm); /* 给名字一些左内边距，使其与气泡对齐或略缩进 */
}
.my-message .sender-name {
  /* 如果自己的消息也显示名字，可能需要不同的对齐 */
  padding-left: 0;
  padding-right: var(--chat-spacing-sm);
}


.message-bubble {
  padding: var(--chat-spacing-md) 14px; /* 使用变量 */
  border-radius: var(--chat-bubble-border-radius);
  word-wrap: break-word; /* 允许长单词换行 */
  white-space: pre-wrap; /* 保留消息中的换行和空格 */
  font-size: var(--chat-text-font-size);
  line-height: 1.5;
  text-align: left; /* 气泡内文字总是左对齐 */
  position: relative; /* 为可能的 "小尾巴" 伪元素做准备 */
}

.my-message .message-bubble {
  background-color: var(--chat-my-message-bg);
  color: var(--chat-my-message-text-color);
  border-bottom-right-radius: var(--chat-bubble-tail-radius); /* 调整右下角圆角形成尾巴效果 */
}

.other-message .message-bubble {
  background-color: var(--chat-other-message-bg);
  color: var(--chat-other-message-text-color);
  border: 1px solid var(--chat-bubble-border-color);
  border-bottom-left-radius: var(--chat-bubble-tail-radius); /* 调整左下角圆角 */
}

.message-time {
  font-size: var(--chat-time-font-size);
  color: var(--chat-time-color);
  margin-top: var(--chat-spacing-xs);
  padding: 0 var(--chat-spacing-xs); /* 时间的轻微内边距 */
  /* text-align 已由 .message-content-wrapper 的 align-items 控制 */
}
/* 移除 .my-message .message-time { left: 8px; } 因为通常由 align-items 控制，如果需要微调，再考虑 */


.file-message-link {
  display: flex;
  align-items: center;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background-color: var(--chat-file-bg);
  border: 1px solid var(--chat-file-border-color);
  border-radius: 8px; /* 可以也使用变量，或者保持独立 */
  text-decoration: none;
  color: inherit; /* 文字颜色继承自父元素气泡，或单独设置 */
  cursor: pointer;
  max-width: 280px; /* 可适当增加文件消息最大宽度 */
  overflow: hidden;
}

.my-message .file-message-link {
  /* 如果希望自己发的文件消息背景和气泡一致，可以这样： */
  /* background-color: transparent; */
  /* border: 1px solid rgba(0,0,0,0.1); */
  /* color: var(--chat-my-message-text-color); */
}

.file-message-link:hover {
  filter: brightness(95%); /* 使用 filter 微调悬停效果，比直接改背景色更通用 */
}

.file-icon {
  font-size: 28px; /* 稍微增大图标 */
  margin-right: var(--chat-spacing-md);
  flex-shrink: 0;
  color: var(--chat-file-icon-color);
}

.file-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.file-name {
  font-weight: 500; /* Normal 是 400, Medium 是 500 */
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 0.9em; /* 相对气泡文字略小 */
}

.file-size {
  font-size: 0.75em; /* 更小一点 */
  color: #777; /* 比 #888 略深一点点 */
  margin-top: 2px;
}

/* 聊天气泡的小尾巴 (可选，增加视觉效果) */
/* 这个实现比较基础，复杂的需要更多技巧 */
.message-bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.other-message .message-bubble::before {
  bottom: var(--chat-bubble-tail-radius); /* 与调整的 border-radius 对应 */
  left: -8px; /* 尾巴宽度的一半，指向左边 */
  border-width: 6px 10px 6px 0; /* 调整形状 */
  border-color: transparent var(--chat-other-message-bg) transparent transparent;
  /* 如果有边框，也需要给尾巴边框，会更复杂 */
}

.my-message .message-bubble::before {
  bottom: var(--chat-bubble-tail-radius);
  right: -8px; /* 指向右边 */
  border-width: 6px 0 6px 10px;
  border-color: transparent transparent transparent var(--chat-my-message-bg);
}

</style>
