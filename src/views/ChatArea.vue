<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-05-03 19:18:01
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-06 13:12:47
 * @FilePath: \chatroomreal\src\views\ChatArea.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="title">{{ currentChat.name }}</div>
    </div>

    <MessageList :messages="currentChat.messages" class="message-list" />

    <!-- <MessageInput @send-message="handleSendMessage" /> -->
    <MessageInput
      v-if="currentChat"
      @send-message="handleSendMessage"
      @send-file="handleSendFile"
      :target-id="currentChat.id"
      :chat-type="currentChat.type"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MessageList from '../components/MessageList.vue'
import MessageInput from '../components/MessageInput.vue'
import { type Chat, type Message } from '@/stores/chat'

export default defineComponent({
  name: 'ChatArea',
  components: {
    MessageList,
    MessageInput,
  },
  props: {
    currentChatId: {
      type: Number,
      required: true,
    },
  },

  //   computed: {
  //     currentChat(): Chat {
  //       return this.chats[this.currentChatId] || { name: '', messages: [] }
  //     },
  //   },
  //   methods: {
  //     handleSendMessage(content: string) {
  //       const newMessage: Message = {
  //         id: Date.now(),
  //         sender: '我',
  //         content,
  //         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //         isMe: true,
  //       }
  //       this.currentChat.messages.push(newMessage)
  //     },
  //   },
  // })

  computed: {
    currentChat(): Chat | null {
      const chat = this.chats[this.currentChatId]
      if (chat) {
        //    // 可以根据需要补充 Chat 接口中的可选字段默认值
        //    return {
        //       ...chat,
        //       id: chat.id !== undefined ? chat.id : this.currentChatId,
        //       type: chat.type || (this.currentChatId === 1 ? 'group' : 'friend') // 确保 type 存在
        //       // unread: chat.unread || 0, // 确保可选字段有默认值
        //    };
        // }
        const chatData = {
          // 准备要返回的数据
          ...chat,
          id: chat.id !== undefined ? chat.id : this.currentChatId,
          type: chat.type || (this.currentChatId === 1 ? 'group' : 'friend'), // 之前的默认逻辑
        }
        // --- 在 return 前打印这个对象 ---
        console.log('ChatArea: currentChat 计算结果:', JSON.stringify(chatData))
        // ---------------------------------
        return chatData
      }
      console.warn(`ChatArea: 未找到 ID 为 ${this.currentChatId} 的聊天。`)
      return null
    },
  },
  methods: {
    handleSendMessage(content: string) {

      console.log(`ChatArea: handleSendMessage 开始执行。接收到的 prop currentChatId: ${this.currentChatId}`);
      const currentChat = this.currentChat; // 获取一次 computed 的值
      // 打印当前计算出的 chat 对象（如果是 null 就打印 'null'）
      console.log('ChatArea: handleSendMessage - 当前计算的 chat 对象:', currentChat ? JSON.stringify(currentChat) : 'null');

      if (!this.currentChat) return
      // ------------------------------------

      // 检查 currentChat 是否有效 (之前的 computed 可能返回 null)

      // 创建新消息，符合导入的 Message 接口
      const newMessage: Message = {
        id: Date.now(), // 临时 ID
        sender: '我', // 特殊标识
        content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        contentType: 1, // 假设 1 代表文本，根据你的定义调整
        // senderName: '我的昵称', // 可选
        // senderAvatarUrl: '我的头像URL', // 可选
      }
      this.currentChat.messages.push(newMessage)

      console.log(`向 ${this.currentChat.type} ${this.currentChat.id} 发送消息: ${content}`)
      // TODO: 调用实际发送消息 API
    },

    handleSendFile(file: File) {
      if (!this.currentChat) {
        console.error('无法发送文件：当前没有活动的聊天。')
        return
      }
      const targetId = this.currentChat.id
      const chatType = this.currentChat.type

      console.log(`准备向 ${chatType} ${targetId} 发送文件: ${file.name}`)

      // TODO: 实现文件上传逻辑...
      // 上传成功后，创建符合 Message 接口的文件消息对象
      // const fileMessage: Message = {
      //   id: response.messageId || Date.now(),
      //   sender: '我',
      //   content: '', // 文件消息内容通常为空或为文件名
      //   time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      //   isMe: true,
      //   contentType: 2, // 假设 2 代表文件，根据你的定义调整
      //   fileName: file.name,
      //   fileSize: file.size,
      //   fileUrl: response.fileUrl, // 从后端获取
      // };
      // this.currentChat?.messages.push(fileMessage);
      // --- 结束 TODO ---
    },
  },
})
</script>

<style scoped>
/* 原有样式保持不变 */
</style>
