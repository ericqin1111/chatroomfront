<template>
  <div class="message-input-wrapper">



    <textarea
      ref="textareaRef"
      v-model="newMessage"
      placeholder="输入消息，Enter 发送，Shift + Enter 换行"
      @keydown="handleKeyDown"
      rows="1"
      @input="adjustTextareaHeight"
    ></textarea>

    <input
      type="file"
      ref="fileInputRef"
      @change="handleFileSelected"
      style="display: none"
      accept="*"
    />
    <button @click="openFilePicker" class="file-button" title="选择文件">
      + </button>

    <button @click="sendMessage" :disabled="isSendDisabled">发送</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
const props = defineProps<{
  targetId: number | string; // 接收目标 ID (好友或群组 ID)
  chatType: 'friend' | 'group'; // 接收聊天类型
}>()

// const newMessage = ref('')
// const emit = defineEmits(['send-message'])
// const textareaRef = ref<HTMLTextAreaElement | null>(null)

// const isSendDisabled = computed(() => newMessage.value.trim().length === 0)

const newMessage = ref('')
// Include 'send-file' in the emitted events
const emit = defineEmits(['send-message', 'send-file'])
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null) // Ref for the file input

const isSendDisabled = computed(() => newMessage.value.trim().length === 0)



const sendMessage = () => {
  const content = newMessage.value.trim()
  if (content) {
    emit('send-message', content)
    newMessage.value = '' // 清空输入框
    nextTick(adjustTextareaHeight) // 重置高度
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // 阻止默认的 Enter 换行
    sendMessage()
  }
  // Shift + Enter 会执行默认换行
}

// 动态调整 textarea 高度
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto' // 先重置为 auto 以获取滚动高度
    // 设置一个最大高度，例如 100px
    const maxHeight = 100
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    // 如果内容超过最大高度，显示滚动条 (通过 CSS overflow)
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement

  
  if (target.files && target.files.length > 0) {
    const file = target.files[0] // Get the first selected file

    console.log('Props received:', props);
    console.log('File selected:', file);

    // 在这里可以添加基于 props 的检查逻辑 (如果需要)
    // 例如，检查 props.targetId 和 props.chatType 是否有效
    if (!props.targetId || !props.chatType) {
       console.error("MessageInput: targetId 或 chatType prop 无效或缺失!");
       target.value = ''; // 重置输入，防止重复触发无效选择
       return; // 提前退出，不发送事件
    }

    emit('send-file', file) // Emit the 'send-file' event with the File object

    
    // Reset the input value to allow selecting the same file again
    target.value = ''
  }
}
</script>

<style scoped>
.message-input-wrapper {
  display: flex;
  align-items: flex-end; /* 按钮和输入框底部对齐 */
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #f7f7f7; /* 输入区域背景色 */
  gap: 10px;
}

textarea {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  margin-right: 10px;
  resize: none; /* 禁止拖动调整大小 */
  overflow-y: hidden; /* 初始隐藏滚动条，由 JS 控制 */
  min-height: 38px; /* 初始最小高度，约等于单行+padding */
  max-height: 100px; /* 限制最大高度 */
  box-sizing: border-box; /* padding 和 border 包含在高度内 */
  font-family: inherit; /* 继承字体 */
}
textarea:focus {
  outline: none;
  border-color: #aaa;
}

button {
  padding: 8px 20px; /* 调整按钮大小 */
  border: none;
  background-color: #07c160; /* 微信绿 */
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0; /* 防止按钮被压缩 */
  height: 38px; /* 与 textarea 初始高度对齐 */
  font-size: 14px;

  display: inline-flex; /* Helps center content vertically */
  align-items: center;
  justify-content: center;
}
button:hover:not(:disabled) {
  background-color: #06ad56; /* 悬停颜色变深 */
}
button:disabled {
  background-color: #a0e7b7; /* 禁用颜色 */
  cursor: not-allowed;
}

.file-button {
  background-color: #6c757d; /* Gray color for file button */
  width: 38px; /* Make it square-ish */
  font-size: 18px; /* Adjust icon size */
}
.file-button:hover:not(:disabled) {
  background-color: #5a6268;
}

/* Send button specific styles */
.send-button {
  background-color: #07c160; /* WeChat green */
  padding-left: 20px; /* More padding for text */
  padding-right: 20px;
}
.send-button:hover:not(:disabled) {
  background-color: #06ad56; /* Darker green on hover */
}
.send-button:disabled {
  background-color: #a0e7b7; /* Disabled color */
}
</style>
