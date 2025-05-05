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
      <!-- 添加添加好友按钮 -->
      <button @click="openAddFriendModal" class="add-friend-button">添加好友</button>
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
            {{ chat.name.substring(0, 1) }}
          </div>
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
    <!-- 添加添加好友模态框 -->
    <el-dialog :visible.sync="addFriendDialogVisible" title="添加好友">
      <template #content>
        <el-form :model="addFriendForm" ref="addFriendFormRef">
          <el-form-item
            label="用户名"
            prop="username"
            :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
          >
            <el-input v-model="addFriendForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <span>
          <el-button @click="addFriendDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addFriend">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useChatStore } from '@/stores/chat';
import axios from 'axios';

// 接口定义
interface Tab {
  id: string;
  name: string;
}
interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: 'group' | 'private';
}

export default defineComponent({
  name: 'AppSidebar',
  // 声明会触发的事件
  emits: ['chat-selected'],

  setup(props, { emit }) {
    // 获取 Pinia store 实例
    const chatStore = useChatStore();

    // 定义响应式状态 (替代 data)
    const activeTab = ref('chat');
    const tabs = ref<Tab[]>([
      { id: 'chat', name: '聊天' },
      { id: 'contact', name: '联系人' },
      { id: 'collect', name: '收藏' },
    ]);
    // 本地模拟聊天列表数据 (实际应用中应来自 Store 或 API)
    const chats = ref<Chat[]>([
      { id: 1, name: '前端开发群', lastMessage: '大家早上好！', time: '09:30', unread: 2, type: 'group' },
      { id: 2, name: '张三', lastMessage: '项目进展如何？', time: '昨天', unread: 0, type: 'private' },
      { id: 3, name: '李四', lastMessage: '晚上一起吃饭吗？', time: '星期一', unread: 1, type: 'private' },
      { id: 4, name: '项目讨论组', lastMessage: 'UI设计稿已更新', time: '2023/12/1', unread: 0, type: 'group' },
    ]);
    // 用于 UI 高亮的本地激活聊天 ID 状态
    const activeChat = ref<number | null>(null);

    // 添加好友相关状态
    const addFriendDialogVisible = ref(false);
    const addFriendForm = ref({
      username: '',
    });
    const addFriendFormRef = ref<unknown>(null);

    const openAddFriendModal = () => {
      addFriendDialogVisible.value = true;
    };

    const addFriend = () => {
      (addFriendFormRef.value as any).validate((valid: boolean) => {
        if (valid) {
          // 发送添加好友请求
          axios
            .post('http://localhost:8080/addFriend', addFriendForm.value)
            .then((response) => {
              console.log('添加好友成功', response.data);
              addFriendDialogVisible.value = false;
              // 刷新联系人列表
              // 这里可以添加刷新联系人列表的逻辑
            })
            .catch((error) => {
              console.error('添加好友失败', error);
            });
        }
      });
    };

    return {
      activeTab,
      tabs,
      chats,
      activeChat,
      openAddFriendModal,
      addFriendDialogVisible,
      addFriendForm,
      addFriendFormRef,
      addFriend,
    };
  },
});
</script>

<style scoped>
/* 其他样式... */
.add-friend-button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #07c160;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.add-friend-button:hover {
  background-color: #06ad56;
}
</style>