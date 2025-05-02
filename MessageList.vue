<template>
  <div class="message-list">
    <div v-for="msg in messages" :key="msg.messageId" class="message">
      <div class="message-header">
        <span class="sender">{{ getSenderName(msg.senderId) }}</span>
        <span class="time">{{ formatTime(msg.sentTime) }}</span>
      </div>
      
      <div class="message-content">
        <template v-if="msg.contentType === 1">
          {{ msg.content }}
        </template>
        
        <template v-else-if="msg.contentType === 2">
          <img 
            v-if="isImage(msg.content)"
            :src="`http://localhost:8080/file/${msg.content}`" 
            style="max-width: 300px;"
          />
          <a v-else :href="`http://localhost:8080/file/${msg.content}`" download>
            下载文件: {{ msg.content }}
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  props: {
    type: { type: String, required: true }, // 'friend' or 'group'
    target: { type: String, required: true } // friendId or groupId
  },
  
  setup(props) {
    const messageMap = inject('messageMap')
    
    const messages = computed(() => {
      const key = `${props.type}-${props.target}`
      return messageMap[key] || []
    })
    
    const getSenderName = (senderId) => {
      // 这里需要实现获取发送者名称的逻辑
      return senderId === currentUserId ? '我' : `用户${senderId}`
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }
    
    const isImage = (fileName) => {
      return /\.(jpg|jpeg|png|gif)$/i.test(fileName)
    }
    
    return {
      messages,
      getSenderName,
      formatTime,
      isImage
    }
  }
}
</script>

<style scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 15px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #666;
}

.message-content {
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 4px;
  display: inline-block;
  max-width: 80%;
}
</style>