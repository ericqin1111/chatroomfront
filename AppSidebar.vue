<template>
    <!-- 模板部分保持不变 -->
    <div class="sidebar-container">
      <!-- 原有模板内容 -->
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  interface Tab {
    id: string
    name: string
  }
  
  interface Chat {
    id: number
    name: string
    lastMessage: string
    time: string
    unread: number
    type: 'group' | 'private'
  }
  
  export default defineComponent({
    name: 'AppSidebar',
    data() {
      return {
        activeTab: 'chat',
        tabs: [
          { id: 'chat', name: '聊天' },
          { id: 'contact', name: '联系人' },
          { id: 'collect', name: '收藏' },
        ] as Tab[],
        chats: [
          { id: 1, name: '前端开发群', lastMessage: '大家早上好！', time: '09:30', unread: 2, type: 'group' },
          { id: 2, name: '张三', lastMessage: '项目进展如何？', time: '昨天', unread: 0, type: 'private' },
          { id: 3, name: '李四', lastMessage: '晚上一起吃饭吗？', time: '星期一', unread: 1, type: 'private' },
          { id: 4, name: '项目讨论组', lastMessage: 'UI设计稿已更新', time: '2023/12/1', unread: 0, type: 'group' },
        ] as Chat[],
        activeChat: 1
      }
    },
    computed: {
      filteredChats(): Chat[] {
        return this.chats
      }
    },
    methods: {
      selectChat(chatId: number) {
        this.activeChat = chatId
        this.$emit('chat-selected', chatId)
      }
    }
  })
  </script>
  
  <style scoped>
  /* 原有样式保持不变 */
  </style>