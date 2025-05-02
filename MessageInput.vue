<template>
  <div class="message-input">
    <textarea
      v-model="form.content"
      @keydown.enter.exact.prevent="sendTextMessage"
      placeholder="输入消息..."
    ></textarea>
    
    <div class="actions">
      <button @click="sendTextMessage" :disabled="!form.content.trim()">
        发送
      </button>
      
      <button @click="triggerFileInput">
        文件
      </button>
      
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileUpload"
      >
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    type: { type: String, required: true }, // 'friend' or 'group'
    target: { type: String, required: true } // friendId or groupId
  },
  
  setup(props, { emit }) {
    const form = ref({
      target: props.target,
      content: ''
    })
    
    const fileInput = ref(null)
    
    const sendTextMessage = () => {
      if (!form.value.content.trim()) return
      
      if (props.type === 'friend') {
        this.$ws.sendMessageToFriend(form.value)
      } else {
        this.$ws.sendMessageToGroup(form.value)
      }
      
      form.value.content = ''
    }
    
    const triggerFileInput = () => {
      fileInput.value.click()
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      if (props.type === 'friend') {
        this.$ws.sendFileToFriend(form.value, file)
      } else {
        this.$ws.sendFileToGroup(form.value, file)
      }
      
      event.target.value = '' // 重置input
    }
    
    return {
      form,
      fileInput,
      sendTextMessage,
      triggerFileInput,
      handleFileUpload
    }
  }
}
</script>

<style scoped>
.message-input {
  border-top: 1px solid #eee;
  padding: 10px;
  background: #f9f9f9;
}

textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
}

button {
  padding: 6px 12px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>