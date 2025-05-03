<template>
  <div class="message-input">
    <textarea
      v-model="form.content"
      @keydown.enter.exact.prevent="sendTextMessage"
      placeholder="输入消息..."
    ></textarea>
    <div class="actions">
      <button @click="sendTextMessage" :disabled="!form.content.trim()">发送</button>
      <button @click="triggerFileInput">文件</button>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileUpload"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  type: 'friend' | 'group';
  target: string;
}
const props = defineProps<Props>();

const form = ref({
  target: props.target,
  content: '',
});
const fileInput = ref<HTMLInputElement | null>(null);

const sendTextMessage = () => {
  if (!form.value.content.trim()) return;
  
  // 根据类型调用不同发送方法（需确保全局 $ws 已挂载）
  if (props.type === 'friend') {
    (window as any).$ws?.sendMessageToFriend(form.value);
  } else {
    (window as any).$ws?.sendMessageToGroup(form.value);
  }
  form.value.content = '';
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const payload = { ...form.value, file };
  if (props.type === 'friend') {
    (window as any).$ws?.sendFileToFriend(payload);
  } else {
    (window as any).$ws?.sendFileToGroup(payload);
  }
  (e.target as HTMLInputElement).value = ''; // 重置 input
};
</script>

<style scoped>
/* 原有样式保留 */
.message-input {
  border-top: 1px solid #eee;
  padding: 10px;
  background: #f9f9f9;
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
}
</style>