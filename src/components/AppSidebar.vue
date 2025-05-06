<!-- <template>
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
          v-for="chat in filteredChats"
          :key="chat.id"
          :class="{ active: chat.id === activeChat }"
          @click="selectChat(chat.id)"
          class="chat-item"
        >
          <div class="avatar-placeholder">
              {{ chat.name.substring(0, 1) }} </div>
          <div class="chat-info">
            <div class="chat-header">
              <span class="chat-name">{{ chat.name }}</span>
              <span class="chat-time">{{ chat.time }}</span>
            </div>
            <div class="chat-message-row">
              <span class="chat-message">{{ chat.lastMessage }}</span>
              <span class="unread-badge" v-if="chat.unread > 0">{{ chat.unread }}</span>
            </div>
          </div>
        </li>
      </ul>

      <div class="contact-list" v-if="activeTab === 'contact'">
        <p>这里显示联系人列表...</p>
      </div>

      <div class="collect-list" v-if="activeTab === 'collect'">
        <p>这里显示收藏列表...</p>
      </div>
    </div>
  </div>
</template> -->

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

      <div class="contact-list" v-if="activeTab === 'contact'">
        <p>这里显示联系人列表...</p>
        </div>

      <div class="collect-list" v-if="activeTab === 'collect'">
        <p>这里显示收藏列表...</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入需要的 Vue API 和 Pinia Store
import { defineComponent, ref, computed } from 'vue'
import { useChatStore,type Chat } from '@/stores/chat' // 确认路径正确


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
  { id: 'chat', name: '聊天' },     // <-- 你问的这行代码在这里
  { id: 'contact', name: '联系人' },
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

// setup 语法糖会自动暴露顶层绑定给模板，无需 return
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AppSidebar',
});

</script>

<style scoped>
/* 这里是之前提供并优化过的 CSS 样式 */
/* 基本样式 - 你需要根据自己的设计调整 */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* 假设父容器提供了高度 */
  width: 280px; /* 侧边栏宽度示例 */
  background-color: #f7f7f7; /* 稍微柔和的背景 */
  border-right: 1px solid #e0e0e0; /* 细边框 */
}

/* Tab 样式 */
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

/* 内容列表区域 */
.content-list {
  flex-grow: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 超出高度时显示滚动条 */
  background-color: #fff; /* 列表区域用白色背景 */
}

.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 聊天列表项 */
.chat-item {
  display: flex;
  align-items: center;
  padding: 10px 12px; /* 调整内边距 */
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0; /* 更浅的分割线 */
  transition: background-color 0.15s ease-out;
}
.chat-item:hover {
  background-color: #f5f7fa; /* 悬停色 */
}
.chat-item.active {
  background-color: #e8f0ff; /* 激活色 */
}

/* 头像占位符 (新增) */
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
}

.chat-info {
  flex-grow: 1;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline; /* 名字和时间基线对齐 */
  margin-bottom: 4px; /* 微调间距 */
}

.chat-name {
  font-weight: 500;
  font-size: 15px; /* 名字稍大 */
  color: #1f1f1f; /* 更深的黑色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.chat-time {
  font-size: 12px;
  color: #8a8a8a; /* 时间颜色 */
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
  color: #606770; /* 消息颜色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin-right: 8px;
}

.unread-badge {
  background-color: #ff3b30; /* 徽标颜色 */
  color: white;
  font-size: 11px;
  font-weight: 500; /* 稍细一点的字重 */
  border-radius: 10px;
  padding: 1px 6px;
  line-height: 1.3;
  text-align: center;
  min-width: 18px;
  flex-shrink: 0;
}

/* 其他列表占位符 */
.contact-list p, .collect-list p {
    padding: 20px;
    text-align: center;
    color: #888;
}
</style>