/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-05-05 00:20:17
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-06 12:02:47
 * @FilePath: \chatroomreal\src\stores\chat.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { WebSocketService } from '@/utils/websocket.ts'
import { useAuthStore } from './auth'
import request from '@/utils/request'

// 定义聊天消息和聊天的类型 (可以放到单独的 types 文件)
// export interface Message {
//   id: number | string // 消息 ID 可以是数字或字符串
//   sender: string
//   content: string
//   time: string
//   isMe: boolean
// }

// export interface Chat {
//   id: number // 聊天本身的 ID
//   type:string
//   name: string
//   messages: Message[]
//   // 可能还有其他属性，如 type, avatar 等
// }


interface RawMessageFromApi {
  messageId: number | string;
  senderId: number; // 或者 string? 确认后端类型
  content: string;
  time: string;
  contentType: number;
  me: boolean; // <-- 后端返回的是 me
  // 可能还有其他字段...
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
}
export interface Message {
  id: number | string // 允许临时数字 ID 或后端字符串/数字 ID
  sender: string // 发送者 ID 或特殊标识如 "我"
  senderName?: string
  senderAvatarUrl?: string
  content: string // 消息内容 (文本或文件描述)
  time: string // 时间字符串
  isMe: boolean // 是否是自己发送的 (用于 UI 显示)
  contentType?: number // 1: 文本, 2: 文件 (根据你的协议)
  // 如果是文件，可能还需要 fileUrl, fileSize, fileName 等
  fileUrl?: string
  fileSize?: number
  fileName?: string
}

// 聊天会话接口
export interface Chat {
  id: number // 聊天 ID (好友 ID 或群组 ID)
  name: string // 聊天名称 (好友昵称或群名称)
  type: 'friend' | 'group' // 聊天类型
  avatarUrl?: string
  messages: Message[] // 消息列表
  unread?: number // 未读消息数 (用于侧边栏)
  lastMessage?: string // 最后一条消息预览 (用于侧边栏)
  time?: number // 最后消息时间 (用于侧边栏)
  loadingMessages?: boolean // (可选) 标记是否正在加载消息
  // 可能还有 avatar 等字段
}

// WebSocketService 发送方法所需的数据结构
export interface SendData {
  target: number
  content?: string
}

// WebSocketService onmessage 回调接收的数据格式 (根据你的 handleDataPacket)
export interface FormattedMessageData {
  messageId: number | string
  senderId: number // 注意：你的代码里 senderId 来自 jsonData.from，确认类型
  content: string // 对于文件是 fileName
  sentTime: string
  contentType: number // 1: text, 2: file
  groupId?: number // 群聊时才有
}

// ---------------- Pinia Store 定义 ----------------
export const useChatStore = defineStore('chat', () => {
  // --- State ---
  // 当前激活的聊天会话 ID，默认为 null 或第一个聊天的 ID
  const activeChatId = ref<number | null>(null) // 初始可以为 null

  // 存储聊天数据的地方 (这里用 ref 包含一个对象)
  // 实际应用中，这些数据应该通过 API 获取并存储在这里
  const authStore = useAuthStore()
  const currentUserId = computed(() => authStore.userId)

  const chats = ref<Record<number, Chat>>({})

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

  const wsInstance = ref<WebSocketService | null>(null) // WebSocket 服务实例

  const isWsConnected = computed(() => !!wsInstance.value && wsInstance.value.isConnected())

  const chatListForSidebar = computed(() => {
    return Object.values(chats.value).sort((a, b) => (b.time || 0) - (a.time || 0)) // 按时间戳倒序
  })
  // --- Actions ---
  function setActiveChatId(id: number | null) {
    activeChatId.value = id
    console.log('[ChatStore] Active chat ID set to:', id)
    // 可选：如果本地没有消息，可以在这里触发 API 加载历史消息
 
    if (id && (!chats.value[id] || chats.value[id].messages.length === 0)) {
      fetchMessages(id);
    }
  }

  // **Action: 从后端 API 获取聊天列表**
  async function fetchChatList() {
    const userId = currentUserId.value
    if (!userId) {
        return
    }
    try {
      const response = await request.get<Chat[]>(`/users/chat`)
      const chatList: Chat[] = response.data // axios 数据在 response.data
      console.log("数据"+response.data)

      const newChats: Record<number, Chat> = {}
      for (const chatData of chatList) {
        newChats[chatData.id] = { ...chatData, messages: [] }
      }
      chats.value = newChats
      console.log('[ChatStore] Chat list fetched and updated.')
    } catch (error) {
      console.error(`[ChatStore] Failed to fetch chat list for user ${userId}:`, error)
    }
  }

  // **Action: 获取消息历史 (使用 request 实例)**
  // async function fetchMessages(chatId: number /*, pagination */) {
  //   const userId = currentUserId.value
  //   const chat = chats.value[chatId]
  //   if (!userId || !chat || chat.loadingMessages) return

  //   try {
  //     chat.loadingMessages = true
  //     console.log(`[ChatStore] Fetching messages for ${chat.type} chat ${chatId}...`)
  //     const endpoint =
  //       chat.type === 'friend'
  //         ? `/api/users/${userId}/messages/friend/${chatId}` // 路径会自动拼接 baseURL
  //         : `/api/users/${userId}/messages/group/${chatId}`
  //     // TODO: 添加分页参数, e.g., { params: { limit: 20, offset: 0 } }

  //     // 4. 使用导入的 request 实例
  //     const response = await request.get<Message[]>(endpoint)
  //     let messages: Message[] = response.data

  //     messages = messages.map((msg) => ({
  //       ...msg,
  //       isMe: msg.sender === userId, // 假设 sender 是 ID
  //     }))

  //     chat.messages = messages.sort(
  //       (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  //     )
  //     console.log(`[ChatStore] Messages updated for chat ${chatId}`)
  //   } catch (error) {
  //     console.error(`[ChatStore] Failed to fetch messages for chat ${chatId}:`, error)
  //   } finally {
  //     chat.loadingMessages = false
  //   }
  // }

  async function fetchMessages(chatId: number | string /*, pagination */) {
    // 1. 获取当前用户 ID 和聊天对象
    const userId = currentUserId.value;
    // **使用 String() 确保 key 是字符串类型进行索引**
    const chatKey = String(chatId);
    const chat = chats.value[chatKey];

    // 检查前置条件
    if (userId === null || userId === undefined || !chat || chat.loadingMessages) { // 明确检查 userId
        console.warn("fetchMessages: Preconditions not met or already loading.", { userId, chatId, chatExists: !!chat, loading: chat?.loadingMessages });
        if (userId === null || userId === undefined) {
            console.error("fetchMessages: Cannot determine current user ID to set 'isMe' flag.");
        }
        if (chat) chat.loadingMessages = false; // 结束加载状态
        return;
    }

    try {
      chat.loadingMessages = true; // 设置加载状态
      console.log(`[ChatStore] Fetching messages for ${chat.type} chat ${chatId}...`);

      // 构造 API 端点
      const endpoint = chat.type === 'friend'
          ? `/api/users/${userId}/messages/friend/${chatId}`
          : `/api/users/${userId}/messages/group/${chatId}`;
      // TODO: 添加分页参数

      // **使用 RawMessageFromApi 泛型来接收原始数据**
      const response = await request.get<RawMessageFromApi[]>(endpoint);
      // 获取消息数组，如果 response.data 为 null/undefined 则使用空数组
      const messagesFromApi: RawMessageFromApi[] = response.data || [];

      console.log('[ChatStore] Received raw messages from API:', JSON.stringify(messagesFromApi, null, 2));

      // **关键：在 map 中进行转换，将 me 映射到 isMe**
      const processedMessages: Message[] = messagesFromApi.map(rawMsg => {
          // **在这里进行字段映射**
          const message: Message = {
              // 确保 Message 接口中的 id 字段名是 messageId 或 id
              // 如果是 id: rawMsg.messageId,
              id: rawMsg.messageId, // 假设 Message 接口用 messageId
              sender: String(rawMsg.senderId), // 确保 sender 是 string
              content: rawMsg.content,
              time: rawMsg.time,
              contentType: rawMsg.contentType,
              isMe: rawMsg.me, // **将后端的 me 赋值给前端的 isMe**
              // 可选：映射文件信息
              fileName: rawMsg.fileName,
              fileSize: rawMsg.fileSize,
              fileUrl: rawMsg.fileUrl,
          };

          // 打印转换后的对象，确认 isMe 正确
          console.log(`  - Processed Msg ID: ${message.id}, Sender: ${message.sender}, isMe: ${message.isMe}`);

          return message; // 返回符合前端 Message 接口的对象
      });
      processedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

       // 更新 store state
       chat.messages = processedMessages;
       console.log(`[ChatStore] Messages updated in store for chat ${chatId} with correct 'isMe'.`);

     } catch (error) {
       console.error(`[ChatStore] Failed to fetch messages for chat ${chatId}:`, error);
       if (chats.value[chatKey]) { // 使用 chatKey
            console.warn(`[ChatStore] Kept existing messages for chat ${chatId} after fetch error.`);
       }
     }
      finally {
       // 确保 chat 对象仍然存在再设置 loading 状态
       if (chats.value[chatKey]) { // 使用 chatKey
            chats.value[chatKey].loadingMessages = false; // 结束加载状态
       }
     }
    }

  // 处理从 WebSocketService 收到的已格式化的消息数据
  function handleIncomingMessage(data: FormattedMessageData) {
    if (data.senderId === currentUserId.value) {
      console.log('[ChatStore] Ignoring self-sent message echo.')
      return
    }

    console.log('[ChatStore] Handling incoming WS message data:', data)
    let targetChatId: number | null = null
    const isMyMessage = false // 需要判断是否是自己发的消息

    // 假设需要一个地方存储当前登录用户的 ID

    const messageToAdd: Message = {
      id: data.messageId,
      sender: data.senderId.toString(), // 或者根据 senderId 查询用户名
      content: data.content,
      time:
        data.sentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: isMyMessage, // **需要正确设置这个值**
      contentType: data.contentType,
      // 如果是文件，可能需要添加 fileName, fileSize, fileUrl
      fileName: data.contentType === 2 ? data.content : undefined,
      // fileUrl: data.fileUrl // 假设 service 能解析并传递 url
    }

    if ('groupId' in data && data.groupId) {
      // 是群消息
      targetChatId = data.groupId
      // if (isMyMessage) { ... } // 自己发的群消息
    } else {
      // 是私聊消息
      // 如果是自己发给别人的消息的回显，target 可能是对方ID
      // 如果是别人发给我的消息，senderId 是对方 ID
      targetChatId = data.senderId // **需要确认 targetId 是否在 data 中**
      // *** 这里的逻辑需要根据你的后端具体实现来定 ***
      // 最简单的情况：总是将收到的私聊消息归类到与对方 senderId 的聊天中
      if (!isMyMessage) {
        targetChatId = data.senderId
      } else {
        // 如果是自己的消息回显，需要知道发给了谁 (targetId)
        // 这个信息可能需要在 FormattedMessageData 中包含
        console.warn('Handling self-sent private message echo not fully implemented.')
        // 可能需要 targetId from FormattedMessageData
        // targetChatId = data.targetId;
        return // 暂时忽略自己的消息回显，或者采取其他逻辑
      }
    }

    if (targetChatId !== null) {
      // 确保聊天对象存在于 state 中
      if (!chats.value[targetChatId]) {
        console.warn(
          `Chat with ID ${targetChatId} not found in store. Creating placeholder or fetching.`,
        )
        // 实际应用需要先获取聊天信息
        chats.value[targetChatId] = {
          id: targetChatId,
          name: `聊天 ${targetChatId}`, // 临时名称
          type: 'groupId' in data && data.groupId ? 'group' : 'friend', // 推断类型
          messages: [],
        }
      }
      // 添加消息到对应的聊天记录
      chats.value[targetChatId].messages.push(messageToAdd)
      console.log(`Message added to chat ${targetChatId} in store.`)
      // 可以在这里触发其他逻辑，比如更新侧边栏的 lastMessage (如果需要)
    } else {
      console.error('Could not determine target chat ID for incoming message.', data)
    }
  }

  // 初始化 WebSocket
  function initWebSocket(token: string) {
    if (wsInstance.value) return // 防止重复初始化
    const ws = new WebSocketService('ws://localhost:8080/websocket?token=' + token)

    // 设置 Service 的回调来调用 Store Action
    ws.onmessage = (formattedData) => {
      handleIncomingMessage(formattedData)
    }
    ws.onopen = () => {
      console.log('[ChatStore] WS Connected.') /* 更新 store 连接状态? */
    }
    ws.onclose = (event) => {
      console.log('[ChatStore] WS Closed.')
      wsInstance.value = null /* 清理实例 */ /* 更新 store 连接状态? */
    }
    ws.onerror = (error) => {
      console.error('[ChatStore] WS Error.')
      wsInstance.value = null /* 清理实例 */ /* 更新 store 连接状态? */
    }

    wsInstance.value = ws // 保存实例
  }


  // 断开 WebSocket
  function disconnectWebSocket() {
    wsInstance.value?.close() // 调用 Service 的 close 方法
    wsInstance.value = null
  }


  // --- 发送 Actions ---
  function sendMessageToFriend(targetId: number, content: string) {
    wsInstance.value?.sendMessageToFriend({ target: targetId, content })
  }
  function sendMessageToGroup(targetId: number, content: string) {
    wsInstance.value?.sendMessageToGroup({ target: targetId, content })
  }
  function sendFileToFriend(targetId: number, file: File, content?: string) {
    wsInstance.value?.sendFileToFriend({ target: targetId, content }, file)
  }
  function sendFileToGroup(targetId: number, file: File, content?: string) {
    wsInstance.value?.sendFileToGroup({ target: targetId, content }, file) // Service 中需要有此方法
  }



  // --- 返回 ---
  return {
    activeChatId,
    chats,
    wsInstance,
    isWsConnected,
    currentChat,
    chatListForSidebar,
    addMessageToActiveChat,
    setActiveChatId,
    handleIncomingMessage,
    initWebSocket,
    disconnectWebSocket,
    sendMessageToFriend,
    sendMessageToGroup,
    sendFileToFriend,
    sendFileToGroup,
    fetchChatList,
    fetchMessages,
  }


})

