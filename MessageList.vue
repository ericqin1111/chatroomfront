<template>
    <div class="message-list">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="['message', { 'me': message.isMe }]"
      >
        <div v-if="!message.isMe" class="sender">{{ message.sender }}</div>
        <div class="content">{{ message.content }}</div>
        <div class="time">{{ message.time }}</div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue'
  
  interface Message {
    id: number
    sender: string
    content: string
    time: string
    isMe: boolean
  }
  
  export default defineComponent({
    name: 'MessageList',
    props: {
      messages: {
        type: Array as PropType<Message[]>,
        required: true
      }
    }
  })
  </script>
  
  <style scoped>
  /* 原有样式保持不变 */
  </style>