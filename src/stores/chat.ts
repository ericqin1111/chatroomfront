/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-05-05 00:20:17
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-07 14:52:03
 * @FilePath: \chatroomreal\src\stores\chat.ts // 确认路径
 * @Description: Chat Store with Friend Request Logic
 */
import { defineStore } from 'pinia';
import { ref, computed,nextTick } from 'vue'; // 移除了 nextTick (如果没用到)
import { WebSocketService } from '@/utils/websocket.ts'; // 确认路径
import { useAuthStore } from './auth'; // 确认路径
import request from '@/utils/request'; // 你的 request 封装实例

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
 
  
  // WebSocketService 发送方法所需的数据结构
  export interface SendData {
    target: number
    content?: string
  }

// 后端好友请求 API 返回的数据结构
export interface ApiFriendRequest {
  id: number;
  requesterId: number;
  targetId: number;
  requestType: number;
  createdAt: string;
  requesterName: string;
}

// 前端好友请求 ViewModel
export interface FriendRequestViewModel {
  id: number;
  senderId: number;
  senderName: string;
  timestamp: string;
}

// 聊天消息接口 (根据你的 fetchMessages 和 handleIncomingMessage 调整)
export interface Message {
  id: number | string;
  sender: string; // 通常是 senderId 的字符串形式
  senderName?: string; // 可选，用于显示
  senderAvatarUrl?: string; // 可选
  content: string;
  time: string;
  isMe: boolean;
  contentType?: number; // 1: 文本, 2: 文件等
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
}

// 聊天会话接口
export interface Chat {
  id: number;
  name: string;
  type: 'friend' | 'group';
  avatarUrl?: string;
  messages: Message[];
  unread?: number;
  lastMessage?: string;
  time?: number; // 时间戳，用于排序
  loadingMessages?: boolean;
}

// WebSocket onmessage 回调接收的数据格式 (根据你的 handleDataPacket)
export interface FormattedMessageData {
  messageId: number | string;
  senderId: number;
  content: string; // 对于文件是 fileName
  sentTime: string;
  contentType: number; // 1: text, 2: file
  groupId?: number; // 群聊时才有
  fileName?:string;
}

// ==================================================
// =========== Pinia Store 定义开始 ================
// ==================================================
export const useChatStore = defineStore('chat', () => {
  // --- State ---
  const authStore = useAuthStore();
  const activeChatId = ref<number | null>(null);
  const chats = ref<Record<number, Chat>>({});
  const wsInstance = ref<WebSocketService | null>(null);
  // **只保留这一个 pendingFriendRequests 定义**
  const pendingFriendRequests = ref<FriendRequestViewModel[]>([]);
  // **currentUserId 直接从 authStore 获取**
  const currentUserId = computed(() => authStore.userId); // 确保 authStore.userId 是响应式的 number | null

  // --- Getters (Computed) ---
  const currentChat = computed((): Chat | null => {
    return activeChatId.value !== null ? chats.value[activeChatId.value] || null : null;
  });
  const isWsConnected = computed(() => !!wsInstance.value && wsInstance.value.isConnected());
  const chatListForSidebar = computed(() => {
    return Object.values(chats.value).sort((a, b) => (b.time || 0) - (a.time || 0));
  });

  const onlineFriendIds = ref<Set<number>>(new Set());
  // --- Actions ---

  function setActiveChatId(id: number | null) {
    activeChatId.value = id;
    console.log('[ChatStore] Active chat ID set to:', id);
    if (id && (!chats.value[id] || chats.value[id].messages.length === 0)) {
      fetchMessages(id);
    }
  }

  async function fetchOnlineFriends() {
    try {
      console.log('[ChatStore] Fetching online friend IDs...');
      // 假设你的 request 工具能处理认证（如自动添加 Authorization header）
      // 并且后端返回的是一个 ID 字符串数组，如 ["1", "2", "3"]
      const response = await request.get<string[]>('/online'); // 使用你截图中的 /online 路径
  
      if (response && response.data && Array.isArray(response.data)) {
        const ids = response.data.map(idStr => parseInt(idStr, 10)).filter(id => !isNaN(id));
        onlineFriendIds.value = new Set(ids);
        console.log('[ChatStore] Online friend IDs updated:', onlineFriendIds.value);
      } else {
        console.warn('[ChatStore] Received unexpected data for online friends:', response);
        onlineFriendIds.value = new Set(); // 清空或保持上一次状态
      }
    } catch (error) {
      console.error('[ChatStore] Failed to fetch online friends:', error);
      // 出错时可以不清空，或者根据策略处理
      // onlineFriendIds.value = new Set();
    }
  }

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

  async function fetchMessages(chatId: number | string) {
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

  

  function handleIncomingMessage(data: FormattedMessageData) {
     // ... (handleIncomingMessage 实现保持不变) ...
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

  function initWebSocket(token: string) {
     // ... (initWebSocket 实现保持不变) ...
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

  function disconnectWebSocket() {
     // ... (disconnectWebSocket 实现保持不变) ...
       wsInstance.value?.close() // 调用 Service 的 close 方法
    wsInstance.value = null
  }

  // --- WebSocket 发送消息 Actions ---
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


  function addMessageToActiveChat(message: Message) {
    if (activeChatId.value !== null && chats.value[activeChatId.value]) {
      chats.value[activeChatId.value].messages.push(message); // 直接 push 传入的 message 对象
      console.log('[ChatStore] Message added to active chat by object:', activeChatId.value);

      // 更新最后消息和时间
      const activeChat = chats.value[activeChatId.value];
      activeChat.lastMessage = message.contentType === 1 ? message.content : (message.fileName || "[文件]");
      activeChat.time = new Date(message.time).getTime();


      // 可选：滚动逻辑
      nextTick(() => {
        // EventBus.emit('scrollToBottom', activeChatId.value);
      });
    } else {
      console.warn('[ChatStore] Cannot add message, no active chat selected or chat data missing.');
    }
  }




  async function fetchFriendRequests() {
    if (currentUserId.value === null) {
      console.warn('[ChatStore] 当前用户ID未设置，无法获取好友请求。');
      pendingFriendRequests.value = [];
      return;
    }
    try {
      const userId = currentUserId.value;
      console.log(`[ChatStore] 正在为用户 ID ${userId} 获取好友请求...`);

      // 1. 调用 API
      const response = await request.get<ApiFriendRequest[]>(
        `/api/social/${userId}/friend-requests/pending`
      );

      // --- !! 增加这里的日志 !! ---
      console.log('[ChatStore] DEBUG: Type of raw response:', typeof response);
      console.log('[ChatStore] DEBUG: Raw response value:', JSON.stringify(response, null, 2));

      let extractedData: ApiFriendRequest[] | null = null; // 用于存储提取结果

      if (response && typeof response === 'object' && response.hasOwnProperty('data')) {
          console.log('[ChatStore] DEBUG: response has "data" property.');
          console.log('[ChatStore] DEBUG: Type of response.data:', typeof response.data);
          console.log('[ChatStore] DEBUG: Is response.data an Array?', Array.isArray(response.data));
          console.log('[ChatStore] DEBUG: response.data value:', JSON.stringify(response.data, null, 2));
          // 尝试直接赋值给临时变量
          extractedData = response.data;
      } else {
          console.error('[ChatStore] DEBUG: response object does not have a .data property or response is not a suitable object.');
          // 如果 response 本身就是数组？（虽然日志显示不是）
          if (Array.isArray(response)) {
              console.log('[ChatStore] DEBUG: response itself IS an array.');
              extractedData = response;
          } else {
             console.error('[ChatStore] DEBUG: Cannot determine how to extract the array from the response.');
          }
      }
      // --- !! 日志结束 !! ---


      // 2. 使用提取出的 extractedData (如果成功的话)
      const apiRequests: ApiFriendRequest[] = extractedData || []; // 使用提取的数据，如果提取失败则为空数组

      // 3. 打印最终 apiRequests 的类型和值
      console.log('[ChatStore] DEBUG: Final apiRequests type:', typeof apiRequests, 'Is Array?', Array.isArray(apiRequests));
      console.log('[ChatStore] DEBUG: Final apiRequests content:', JSON.stringify(apiRequests));


      // 4. 检查 apiRequests 是否真的是数组再调用 map
      if (!Array.isArray(apiRequests)) {
          console.error('[ChatStore] 获取到的 apiRequests 最终不是一个数组!', apiRequests);
          pendingFriendRequests.value = [];
          return;
      }

      // // 5. 数据映射
      // console.log('[ChatStore] DEBUG: Starting data mapping...');
      // const mappedRequests = apiRequests.map(apiReq => { /* ... 映射逻辑 ... */ });
      // console.log('[ChatStore] DEBUG: Finished mapping. Result:', JSON.stringify(mappedRequests));

      const mappedRequests = apiRequests.map(apiReq => {
        // **日志点 4 (循环内部)**
        console.log('[ChatStore] DEBUG: Mapping item:', JSON.stringify(apiReq)); // <-- 1. 确认这个日志打印了吗？apiReq 是什么？

        // **检查点：这里的属性访问是关键**
        const viewModel = {
          id: apiReq.id ?? null,
          senderId: apiReq.requesterId ?? null,
          senderName: apiReq.requesterName ?? '未知用户',
          timestamp: apiReq.createdAt ?? '未知时间',
        };

        // **日志点 5 (循环内部)**
        console.log('[ChatStore] DEBUG: Mapped item to viewModel:', JSON.stringify(viewModel)); // <-- 2. 确认 viewModel 的值是什么？

        // **检查点：是不是这里有其他逻辑导致提前返回了 null/undefined？**
        // 例如，是不是有什么 if 条件判断失败了？
        // 或者不小心写成了 return null; ?

        return viewModel; // <-- 3. 确认这里确实返回的是 viewModel 对象
    });
  //   const mappedRequests = apiRequests.map(apiReq => {
  //     // 只打印和返回 ID
  //     const currentId = apiReq?.id; // 使用可选链确保安全
  //     console.log('[ChatStore] DEBUG: Mapping item ID:', currentId);
  //     return currentId; // <-- 只返回 ID (或者 return { testId: currentId };)
  // });
  // console.log('[ChatStore] DEBUG: Finished SIMPLIFIED mapping. Result:', JSON.stringify(mappedRequests));

      // 6. 更新状态
      console.log('[ChatStore] DEBUG: Assigning mapped requests to pendingFriendRequests.value...');
      pendingFriendRequests.value = mappedRequests;
      console.log('[ChatStore] DEBUG: State updated. pendingFriendRequests.value:', JSON.stringify(pendingFriendRequests.value));

      console.log('[ChatStore] 已获取并映射好友请求:', pendingFriendRequests.value);

    } catch (error) {
      console.error('[ChatStore] 获取好友请求失败:', error);
      pendingFriendRequests.value = [];
    }
  }

  async function acceptFriendRequest(requestId: number) {
    if (currentUserId.value === null) { /* ... */ return; }

    const aliasName=localStorage.getItem('username');
    console.log('[ACCEPTFRIENDREQUEST]:'+aliasName);
    
    try {
      const userId = currentUserId.value;
      console.log(`[ChatStore] 用户 ${userId} 正在接受好友请求: ${requestId}`);
      await request.post(
        `/api/social/${userId}/friend-requests/${requestId}/accept`, // 使用正确的 URL
         { aliasName: aliasName }
      );
      console.log(`[ChatStore] 已成功接受好友请求: ${requestId}`);
      pendingFriendRequests.value = pendingFriendRequests.value.filter(req => req.id !== requestId);
      // TODO: 刷新好友列表 fetchChatList();
    } catch (error) { console.log("Mistake") }
  }

  async function declineFriendRequest(requestId: number) {
     if (currentUserId.value === null) { /* ... */ return; }
    try {
      const userId = currentUserId.value;
      console.log(`[ChatStore] 用户 ${userId} 正在拒绝好友请求: ${requestId}`);
      await request.get(
        `/api/social/${userId}/friend-requests/${requestId}/decline` // 使用正确的 URL
      );
      console.log(`[ChatStore] 已成功拒绝好友请求: ${requestId}`);
      pendingFriendRequests.value = pendingFriendRequests.value.filter(req => req.id !== requestId);
    } catch (error) { /* ... 错误处理 ... */ }
  }

  async function sendFriendRequest(targetUserId: string) {
    if (currentUserId.value === null) { /* ... */ throw new Error('用户未登录'); }
    // TODO: 获取真实的 currentUserName
    const currentUserName = "当前登录用户"; // !! 需要替换 !!
    try {
        const userId = currentUserId.value;
        console.log(`[ChatStore] 用户 ${userId} 正在向 用户ID:${targetUserId} 发送好友请求...`);
        const payload = {
            targetUserId: targetUserId,
            requesterName: currentUserName
        };

        console.log('[ChatStore] ACTION sendFriendRequest: currentUserId =', userId);
        console.log('[ChatStore] ACTION sendFriendRequest: targetUserId =', targetUserId);
        console.log('[ChatStore] ACTION sendFriendRequest: currentUserName =', currentUserName);
        // console.log('[ChatStore] ACTION sendFriendRequest: Payload Object BEFORE sending:', JSON.stringify(payload, null, 2));

        await request.post(
            `/api/social/${userId}/friend-requests/send`, // 使用正确的 URL
            payload
        )
        console.log(`[ChatStore] 已成功向 ${targetUserId} 发送好友请求。`);
    } catch (error) { /* ... 错误处理 ... */ throw error; }
  }


  async function createGroup(groupName: string, userIds: number[], usernames: string[]) {
    const currentAuthUserId = authStore.userId; // 获取当前登录用户的ID，可能用于API路径或记录创建者
    if (!currentAuthUserId) {
      console.error('[ChatStore] Create group failed: User not authenticated.');
      throw new Error('用户未认证，无法创建群组');
    }

    console.log(`[ChatStore] Attempting to create group: ${groupName} with users: ${userIds.join(', ')}`);

    try {
      // 假设你的后端创建群组 API 路径是 /api/group/create
      // 并且它期望的请求体是 { groupName, userIds, usernames }
      // 后端 Netty Handler 我们讨论的是 /api/group/create
      // 如果你的实际后端路径是 /users/group/create 或其他，请相应修改
      const response = await request.post<{ groupId: number; message: string }>(
        `/api/group/create`, // <--- 确认这是你后端 Netty Handler 中定义的实际路径
        {
          groupName,
          userIds,
          usernames // 后端需要这个来设置成员别名等
        }
      );

      console.log('[ChatStore] Group created successfully:', response.data);

      // 群组创建成功后，刷新聊天列表以包含新群组
      // 也可以根据后端返回的 response.data.groupId 直接将新群组添加到 chats.value 中（乐观更新或精确更新）
      // 为简单起见，这里先刷新整个列表
      await fetchChatList();

      // 你可以返回新群组的 ID 或其他信息，如果需要
      return response.data;

    } catch (error) {
      console.error('[ChatStore] Failed to create group:', error);
      // 根据你的 request 封装，错误信息可能在 error.response.data.error 或其他地方
      const errorMessage = (error as any)?.response?.data?.error || '创建群组失败，请稍后再试';
      throw new Error(errorMessage);
    }
  }

  

  // --- 返回 State 和 Actions ---
  // **确保包含了所有需要从组件中访问的 state 和 action**
  return {
    // State refs & Computed
    activeChatId,
    chats,
    wsInstance, // 如果组件需要直接访问ws实例
    isWsConnected,
    currentChat,
    chatListForSidebar,
    pendingFriendRequests: computed(() => pendingFriendRequests.value), // 返回计算属性或直接 ref
    currentUserId, // 如果组件需要直接读取

    // Actions
    setActiveChatId,
    fetchChatList,
    fetchMessages,
    addMessageToActiveChat, // 如果有的话
    handleIncomingMessage, // 通常由ws回调内部调用，不一定需要导出
    initWebSocket,
    disconnectWebSocket,
    sendMessageToFriend,
    sendMessageToGroup,
    sendFileToFriend,
    sendFileToGroup,
    fetchFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    sendFriendRequest,
    createGroup,
    onlineFriendIds,
    fetchOnlineFriends
  };
});