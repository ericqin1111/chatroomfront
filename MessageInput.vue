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
    <button @click="sendMessage" :disabled="isSendDisabled">发送</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const newMessage = ref('')
const emit = defineEmits(['send-message'])
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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

const uploadFile = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) {
    console.warn('未选择文件');
    return;
  }

  
  try {
    const formData = new FormData();
    formData.append('file', file);
    // 可附加其他参数
    formData.append('uploadTime', new Date().toISOString());

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // 显示上传进度
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`上传进度: ${percent}%`);
      },
    });

    console.log('上传成功', response.data);
    // 触发消息发送（假设有全局状态管理）
    sendFileMessage(response.data.fileUrl);
    
  } catch (error) {
    console.error('上传失败', error);
    alert(`上传失败: ${getErrorMessage(error)}`);
  }
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : '未知错误';
};
</script>

<style scoped>
.message-input-wrapper {
  display: flex;
  align-items: flex-end; /* 按钮和输入框底部对齐 */
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #f7f7f7; /* 输入区域背景色 */
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
}
button:hover:not(:disabled) {
  background-color: #06ad56; /* 悬停颜色变深 */
}
button:disabled {
  background-color: #a0e7b7; /* 禁用颜色 */
  cursor: not-allowed;
}
</style>
