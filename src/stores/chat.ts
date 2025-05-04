/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-05-05 00:20:17
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-05 00:58:31
 * @FilePath: \chatroomreal\src\stores\chat.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义聊天消息和聊天的类型 (可以放到单独的 types 文件)
export interface Message {
  id: number | string // 消息 ID 可以是数字或字符串
  sender: string
  content: string
  time: string
  isMe: boolean
}

export interface Chat {
  id: number // 聊天本身的 ID
  name: string
  messages: Message[]
  // 可能还有其他属性，如 type, avatar 等
}

// ---------------- Pinia Store 定义 ----------------
export const useChatStore = defineStore('chat', () => {
  // --- State ---
  // 当前激活的聊天会话 ID，默认为 null 或第一个聊天的 ID
  const activeChatId = ref<number | null>(null) // 初始可以为 null

  // 存储聊天数据的地方 (这里用 ref 包含一个对象)
  // 实际应用中，这些数据应该通过 API 获取并存储在这里
  const chats = ref<Record<number, Chat>>({
    // 示例模拟数据 (应替换为 API 获取)
    1: {
      id: 1,
      name: '前端开发群',
      messages: [
        { id: 1, sender: '张三', content: '早上好！', time: '09:30', isMe: false },
        { id: 2, sender: '我', content: '早上好！今天有什么计划？', time: '09:32', isMe: true },
      ],
    },
    2: {
      id: 2,
      name: '张三',
      messages: [
        { id: 101, sender: '张三', content: '项目进展如何？', time: '昨天', isMe: false },
        { id: 102, sender: '我', content: '基本完成了', time: '昨天', isMe: true },
      ],
    },
    // ... 其他聊天数据
  })

  // --- Actions ---
  // 设置当前激活的聊天 ID
  function setActiveChatId(id: number | null) {
    activeChatId.value = id
    console.log('[ChatStore] Active chat ID set to:', id) // 调试日志
    // 可以在这里触发获取该聊天详细信息或消息列表的 API 调用（如果需要的话）
  }

  // 向当前激活的聊天添加新消息 (示例)
  function addMessageToActiveChat(message: Message) {
    if (activeChatId.value !== null && chats.value[activeChatId.value]) {
      chats.value[activeChatId.value].messages.push(message)
      console.log('[ChatStore] Message added to chat:', activeChatId.value) // 调试日志
    } else {
      console.warn('[ChatStore] Cannot add message, no active chat selected or chat data missing.')
    }
  }

  // --- Getters (使用 computed) ---
  // 获取当前激活的聊天对象
  const currentChat = computed((): Chat | null => {
    if (activeChatId.value === null) {
      return null // 或者返回一个表示“未选择”的默认对象
    }
    return chats.value[activeChatId.value] || null // 从本地数据查找
  })

  // 返回 state, actions, getters
  return {
    
    activeChatId,
    chats, // 也可以不直接暴露 chats，只暴露 currentChat
    setActiveChatId,
    addMessageToActiveChat,
    currentChat,
  }
})
