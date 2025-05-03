<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="title">{{ currentChat.name }}</div>
    </div>
    
    <MessageList :messages="currentChat.messages" class="message-list" />
    
    <MessageInput @send-message="handleSendMessage" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

interface Message {
  id: number
  sender: string
  content: string
  time: string
  isMe: boolean
}

interface Chat {
  name: string
  messages: Message[]
}

export default defineComponent({
  name: 'ChatArea',
  components: {
    MessageList,
    MessageInput
  },
  props: {
    currentChatId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      chats: {
        1: {
          name: '前端开发群',
          messages: [
            { id: 1, sender: '张三', content: '早上好！', time: '09:30', isMe: false },
            { id: 2, sender: '我', content: '早上好！今天有什么计划？', time: '09:32', isMe: true },
            { id: 3, sender: '李四', content: '早上好', time: '09:33', isMe: false },
          ]
        },
        2: {
          name: '张三',
          messages: [
            { id: 1, sender: '张三', content: '项目进展如何？', time: '昨天', isMe: false },
            { id: 2, sender: '我', content: '基本完成了', time: '昨天', isMe: true },
          ]
        }
      } as Record<number, Chat>
    }
  },
  computed: {
    currentChat(): Chat {
      return this.chats[this.currentChatId] || { name: '', messages: [] }
    }
  },
  methods: {
    handleSendMessage(content: string) {
      const newMessage: Message = {
        id: Date.now(),
        sender: '我',
        content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
      this.currentChat.messages.push(newMessage)
    }
  }
})
</script>

<style scoped>
/* 原有样式保持不变 */
</style>