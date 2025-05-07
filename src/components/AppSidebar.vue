
<template>
  <div class="sidebar-container">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: tab.id === activeTab }"
        @click="activeTab = tab.id"
        class="tab-button"
      >
        {{ tab.name }}
      </button>
    </div>

    <div class="content-list">
      <ul class="chat-list" v-if="activeTab === 'chat'">
        <li
          v-for="chat in chatListForSidebar"
          :key="chat.id"
          :class="{ active: chat.id === activeChatId }" @click="selectChat(chat.id)"
          class="chat-item"
        >
          <div class="avatar-placeholder">
              {{ chat.name.substring(0, 1) }}
          </div>
          <div class="chat-info">
            <div class="chat-header">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-time">{{ chat.lastMessageTime }}</span>
            </div>
            <div class="chat-message-row">
              <span class="chat-message">{{ chat.lastMessageContent }}</span>
              <span class="unread-badge" v-if="chat.unreadCount && chat.unreadCount > 0">{{ chat.unreadCount }}</span>
            </div>
          </div>
        </li>
      </ul>


      <div class="contact-list-container" v-if="activeTab === 'contacts'">
        

        <div class="contact-actions-header">
            <button class="action-button" @click="openAddFriendModal" title="添加好友">
              <font-awesome-icon icon="user-plus" />
             </button>
             <button class="action-button" @click="handleCreateGroup" title="创建群聊">
              <font-awesome-icon icon="users" />
             </button>
        </div>

        <AddFriendModal
      :visible="isAddFriendModalVisible"
      @close="closeAddFriendModal"
      @send-request="handleSendFriendRequestFromModal"
    />
        

         <div class="contact-section">
            <h3 class="contact-section-header">群聊</h3>
            <ul class="contact-list">
               <li
                  v-for="group in groupList"
                  :key="group.id"
                  @click="selectChat(group.id)"
                  :class="{ active: group.id === activeChatId }"
                  class="contact-item"
                >
                    <div class="avatar-placeholder">
                        <img v-if="group.avatarUrl" :src="group.avatarUrl" :alt="group.name.substring(0, 1)" class="avatar-real">
                        <span v-else>{{ group.name.substring(0, 1) }}</span>
                     </div>
                     <span class="contact-name">{{ group.name }}</span>
                </li>
                <li v-if="groupList.length === 0" class="empty-list-placeholder">
                    暂无群聊
                </li>
            </ul>
         </div>

         <div class="contact-section">
            <h3 class="contact-section-header">好友</h3>
             <ul class="contact-list">
               <li
                 v-for="friend in friendList"
                 :key="friend.id"
                 @click="selectChat(friend.id)"
                 :class="{ active: friend.id === activeChatId }"
                 class="contact-item"
                >
                    <div class="avatar-placeholder">
                         <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="friend.name.substring(0, 1)" class="avatar-real">
                         <span v-else>{{ friend.name.substring(0, 1) }}</span>
                     </div>
                     <span class="contact-name">{{ friend.name }}</span>
                </li>
                 <li v-if="friendList.length === 0" class="empty-list-placeholder">
                    暂无好友
                </li>
            </ul>
         </div>
      </div>

      <div class="friend-requests-section" v-if="pendingFriendRequests.length > 0">
        <h3 class="contact-section-header">好友请求 ...</h3>
        <ul class="request-list">
            <li v-for="request in pendingFriendRequests" :key="request.id" class="request-item">
                <span><p>{{ request.senderId }}</p></span>
                <button @click="handleAcceptRequest(request.id)">接受</button>
                <button @click="handleDeclineRequest(request.id)">拒绝</button>
                <span>{{ request.timestamp }}</span>

            </li>
        </ul>
    </div>
    <div v-else-if="activeTab === 'contacts'" class="empty-list-placeholder small-padding">
         暂无新的好友请求
    </div>

      <div class="collect-list" v-if="activeTab === 'collect'">
        <p>这里显示收藏列表...</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入需要的 Vue API 和 Pinia Store
import { defineComponent, ref, computed,watch } from 'vue'
import { useChatStore,type Chat } from '@/stores/chat' // 确认路径正确
import AddFriendModal from './AddFriendModel.vue';


// 接口定义
interface Tab {
  id: string
  name: string
}

// 获取 Pinia store 实例
const chatStore = useChatStore();

// --- 定义响应式状态 ---

// 控制当前激活的 Tab (本地状态)
const activeTab = ref('chat');

// **这里定义了 Tab 按钮的数据**
const tabs = ref<Tab[]>([
  { id: 'chat', name: '聊天' },    
  { id: 'contacts', name: '联系人' },
  { id: 'collect', name: '收藏' },
  // 你可以在这里添加或修改 Tab
]);

// 从 store 获取计算好的、排序后的聊天列表，用于 v-for
const chatListForSidebar = computed(() => chatStore.chatListForSidebar);

// 从 store 获取当前激活的聊天 ID，用于高亮列表项
const activeChatId = computed(() => chatStore.activeChatId);

// --- 定义方法 ---

// 当用户点击聊天列表项时调用
const selectChat = (chatId: number) => {
  // 只调用 Pinia Action 来更新全局激活的聊天 ID
  chatStore.setActiveChatId(chatId);
  console.log(`Sidebar: Set active chat ID in store to: ${chatId}`);
};

const groupList = computed(() => {
  // Object.values(chatStore.chats) 会返回一个包含所有 Chat 对象的数组
  return Object.values(chatStore.chats).filter(chat => chat.type === 'group');
});

// 正确的写法：先获取对象的值（数组），再过滤
const friendList = computed(() => {
  // Object.values(chatStore.chats) 会返回一个包含所有 Chat 对象的数组
  return Object.values(chatStore.chats).filter(chat => chat.type === 'friend');
});

const isAddFriendModalVisible = ref(false);

const openAddFriendModal = () => {
  isAddFriendModalVisible.value = true;
};

const closeAddFriendModal = () => {
  isAddFriendModalVisible.value = false;
};

const handleSendFriendRequestFromModal = async (targetUserId: string) => { // 参数就是 Modal emit 出来的 identifier
  console.log(`准备调用 store action 发送好友请求给 ID: ${targetUserId}`);
  try {
    // 调用 store action (这个 action 内部会调用后端 API)
    await chatStore.sendFriendRequest(targetUserId);
    alert(`已成功向用户 ${targetUserId} 发送好友请求！`); // 简单的成功提示
    closeAddFriendModal(); // 发送成功后关闭 Modal
  } catch (error) {
    console.error('发送好友请求失败 (来自侧边栏组件):', error);
    alert('发送好友请求失败，请稍后再试。'); // 简单的错误提示
    // 出错时可以选择不关闭 Modal，让用户重试
  }
};
const handleCreateGroup = () => {
    console.log('Trigger: Create Group');
    // 在这里添加你的逻辑，例如：
    // - 打开一个选择联系人创建群组的模态框
    // - 导航到一个新的页面
    // alert('创建群聊功能待实现');
};

const pendingFriendRequests = computed(() => chatStore.pendingFriendRequests);

const handleAcceptRequest = (requestId: string | number) => {
    console.log('Accepting request:', requestId);
    chatStore.acceptFriendRequest(requestId);
};

const handleDeclineRequest = (requestId: string | number) => {
    console.log('Declining request:', requestId);
    chatStore.declineFriendRequest(requestId);
};

watch(activeTab, (newTabId, oldTabId) => {
  console.log(`Tab changed from ${oldTabId} to ${newTabId}`);
  // 当切换到 'contacts' 标签页时
  if (newTabId === 'contacts') {
    // 并且确保当前用户ID有效
    if (chatStore.currentUserId) {
      console.log('Switched to contacts tab, fetching friend requests...');
      // 调用 store action 获取好友请求
      chatStore.fetchFriendRequests();
      chatStore.fetchChatList();
    } else {
      console.warn('Switched to contacts tab, but currentUserId is null, cannot fetch friend requests.');
      // 这里可以考虑监听 authStore 的登录状态，在登录后获取一次
    }
  }
  // 你也可以在这里添加切换到其他 tab 时需要执行的逻辑，比如获取聊天列表
  // if (newTabId === 'chat' && chatStore.currentUserId) {
  //   chatStore.fetchChatList(); // 示例：切换到聊天页时获取聊天列表
  // }
}, {
  // immediate: true // 设置为 true 会在组件初始化时立刻执行一次 watch 的回调函数
                     // 如果希望组件一加载（如果初始 tab 是 'contacts'）就获取请求，可以设为 true
                     // 如果只希望在用户 *点击切换* 到 'contacts' 时才获取，可以设为 false 或省略 (默认为 false)
                     // 考虑到你可能在登录时已获取，这里设为 false 可能更合适，避免重复加载
  immediate: false
});


// setup 语法糖会自动暴露顶层绑定给模板，无需 return
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AppSidebar',
});

</script>

<style scoped>
/* --- 基础容器和布局 --- */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* 假设父容器提供了高度 */
  width: 280px; /* 侧边栏宽度示例 */
  background-color: #f7f7f7; /* 稍微柔和的背景 */
  border-right: 1px solid #e0e0e0; /* 细边框 */
}

/* --- Tab 样式 --- */
.tabs {
  display: flex;
  flex-shrink: 0;
  background-color: #f7f7f7; /* 保持背景一致 */
  padding: 0 10px; /* 给 tabs 左右一些内边距 */
}

.tab-button {
  flex: 1;
  padding: 12px 5px; /* 调整内边距 */
  background: none; /* 无背景 */
  border: none;
  border-bottom: 3px solid transparent; /* 预留激活下划线空间 */
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  color: #606770; /* 默认颜色 */
  position: relative;
  transition: color 0.2s ease;
  margin: 0 5px; /* Tab 之间加点间距 */
}
.tab-button:hover {
  color: #1d2129; /* 悬停颜色 */
}
.tab-button.active {
  color: #0b57d0; /* 激活颜色 */
  font-weight: 600; /* 加粗一点 */
  border-bottom-color: #0b57d0; /* 激活下划线 */
}

/* --- 内容列表区域 --- */
.content-list {
  flex-grow: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 超出高度时显示滚动条 */
  background-color: #fff; /* 列表区域用白色背景 */
}

/* --- 列表通用: 清除默认样式 --- */
.chat-list, .contact-list { /* 应用到聊天和联系人列表 */
  list-style: none;
  padding: 0;
  margin: 0;
}

/* --- 列表项通用样式 (聊天和联系人) --- */
.chat-item, .contact-item {
  display: flex;
  align-items: center;
  padding: 10px 12px; /* 统一内边距 */
  cursor: pointer;
  /* border-bottom: 1px solid #f0f0f0; /* 使用伪元素分割线代替 */
  transition: background-color 0.15s ease-out;
  position: relative; /* 为了伪元素定位 */
}
.chat-item:hover, .contact-item:hover {
  background-color: #f5f7fa; /* 统一悬停色 */
}
.chat-item.active, .contact-item.active {
  background-color: #e8f0ff; /* 统一激活色 */
}

/* --- 列表项分割线 (使用伪元素) --- */
.chat-item:not(:last-child)::after,
.contact-item:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    /* left = 头像宽度(42) + 右外边距(10) = 52px */
    left: 52px;
    right: 12px; /* 对应右侧内边距 */
    height: 1px;
    background-color: #f0f0f0; /* 分割线颜色 */
}


/* --- 头像占位符 (来自你的样式) --- */
.avatar-placeholder {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #dcdcdc; /* 占位符颜色 */
    margin-right: 10px; /* 和右侧信息拉开距离 */
    flex-shrink: 0; /* 防止被压缩 */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px; /* 字母大小 */
    font-weight: bold;
    color: #fff; /* 字母颜色 */
    overflow: hidden; /* 添加此行，确保图片不超出 */
}
/* --- 【新增】真实头像样式 --- */
.avatar-real {
    width: 100%;
    height: 100%;
    object-fit: cover; /* 确保图片覆盖区域 */
}


/* --- 聊天列表特定样式 (来自你的样式) --- */
.chat-info {
  flex-grow: 1;
  overflow: hidden;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.chat-name { /* 也可用于联系人名称，但联系人处有单独定义 */
  font-weight: 500;
  font-size: 15px;
  color: #1f1f1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}
.chat-time {
  font-size: 12px;
  color: #8a8a8a;
  flex-shrink: 0;
  white-space: nowrap;
}
.chat-message-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.chat-message {
  font-size: 13px;
  color: #606770;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin-right: 8px;
}
.unread-badge {
  background-color: #ff3b30;
  color: white;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
  padding: 1px 6px;
  line-height: 1.3;
  text-align: center;
  min-width: 18px;
  flex-shrink: 0;
}

/* --- 【新增】联系人列表特定样式 --- */
.contact-list-container {
    padding: 0; /* 容器本身无内边距 */
}
.contact-section {
    margin: 0;
}
.contact-section-header {
    
    font-size: 12px;
    color: #606770; /* 使用 Tab 默认文字颜色 */
    padding: 6px 12px; /* 左右内边距同列表项 */
    margin: 0;
    font-weight: 400;
    background-color: #f0f2f5; /* 轻微区分背景色 */
    border-bottom: 1px solid #e5e5e5; /* 细下边框 */
    position: sticky; /* 滚动时置顶 */
    top: 0;
    z-index: 1;
}
/* 联系人列表项 (.contact-item) 复用 .chat-item 的基础样式 */
.contact-name { /* 联系人名称样式 */
  font-weight: 400; /* 普通字重 */
  font-size: 15px;  /* 与聊天名称一致 */
  color: #1f1f1f;   /* 与聊天名称一致 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;    /* 占据剩余空间 */
}

/* --- 【新增】空列表占位符 --- */
.empty-list-placeholder {
    text-align: center;
    padding: 30px 15px;
    color: #8a8a8a; /* 使用时间颜色 */
    font-size: 13px;
}

/* --- 收藏列表占位符 (来自你的样式) --- */
.collect-list p {
    padding: 20px;
    text-align: center;
    color: #888;
}

/* --- 【新增】滚动条样式 (可选) --- */
.content-list::-webkit-scrollbar {
  width: 5px;
}
.content-list::-webkit-scrollbar-thumb {
  background-color: #cccccc; /* 滑块颜色 */
  border-radius: 3px;
}
.content-list::-webkit-scrollbar-track {
  background-color: transparent; /* 轨道透明 */
}
.contact-actions-header {
    display: flex;
    justify-content: flex-start; /* 将按钮放在右侧 */
    align-items: center;
    padding: 8px 12px; /* 内边距 */
    border-bottom: 1px solid #e5e5e5; /* 加条分割线 */
    background-color: #fff; /* 背景色 */
}
.action-button {
    background: none;
    border: none;
    padding: 4px;
    margin-left: 8px; /* 按钮间距 */
    cursor: pointer;
    color: #606770; /* 图标颜色 */
    font-size: 18px; /* 图标大小 */
    line-height: 1;
}
.action-button:hover {
    color: #1d2129;
}
/* 如果有搜索框 */
.contact-search {
    flex-grow: 1; /* 占据左侧空间 */
    margin-right: 10px;
    /* ... 其他搜索框样式 ... */
}

</style>
