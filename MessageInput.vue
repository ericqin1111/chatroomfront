<template>
    <div class="message-input">
      <textarea 
        v-model="message" 
        @keydown.enter.exact.prevent="sendMessage"
        placeholder="输入消息..."
      ></textarea>
      <button @click="sendMessage">发送</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    name: 'MessageInput',
    data() {
      return {
        message: ''
      }
    },
    methods: {
      sendMessage() {
        if (this.message.trim()) {
          this.$emit('send-message', this.message.trim())
          this.message = ''
        }
      }
    },
    emits: ['send-message'] // 明确声明emit事件
  })
  </script>
  
  <style scoped>
  /* 原有样式保持不变 */
  </style>