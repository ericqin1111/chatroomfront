<template>
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>创建新群聊</h3>
        <div class="form-group">
          <label for="groupName">群聊名称:</label>
          <input type="text" id="groupName" v-model="groupName" placeholder="输入群聊名称" />
        </div>
        <div class="form-group">
          <label>选择成员:</label>
          <div v-for="friend in availableFriends" :key="friend.id" class="member-selection">
            <input type="checkbox" :id="'user-' + friend.id" :value="friend.id" v-model="selectedMemberIds" />
            <label :for="'user-' + friend.id">{{ friend.name }} (ID: {{ friend.id }})</label>
          </div>
          <p v-if="!availableFriends || availableFriends.length === 0">暂无可选择的好友</p>
        </div>
        <div class="modal-actions">
          <button @click="handleSubmit" :disabled="!isFormValid">创建</button>
          <button @click="closeModal">取消</button>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';
// import { useChatStore, type Chat } from '@/stores/chat'; // Chat 类型可能不需要在这里
import { useAuthStore } from '@/stores/auth'; // <-- 1. 导入你的 auth store

interface FriendForSelection {
  id: number;
  name: string;
}

const props = defineProps<{
  visible: boolean;
  friends: FriendForSelection[];
}>();

const emit = defineEmits(['close', 'create']);

const authStore = useAuthStore(); // <-- 2. 获取 auth store 实例

const groupName = ref('');
const selectedMemberIds = ref<number[]>([]); // 这是用户通过复选框选择的成员
const errorMessage = ref('');

const availableFriends = computed(() => props.friends);

const isFormValid = computed(() => {
  // 创建群组时，即使没有选择其他成员，只要有群名，也应该允许创建（因为创建者会自动加入）
  // 或者，你也可以要求至少选择一个其他成员 (selectedMemberIds.value.length > 0)
  // 这里我们假设只要有群名，就可以创建（创建者自己也是一个成员）
  return groupName.value.trim() !== '';
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    groupName.value = '';
    selectedMemberIds.value = [];
    errorMessage.value = '';
  }
});

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!groupName.value.trim()) { // 只需要群名非空即可，因为创建者会自动加入
    errorMessage.value = '请填写群聊名称。';
    return;
  }
  errorMessage.value = '';

  const currentUserId = authStore.userId;
  const currentUsername = authStore.username; // <-- 3. 假设 authStore 中有 username

  if (!currentUserId || typeof currentUsername === 'undefined' || currentUsername === null) {
    errorMessage.value = '无法获取当前用户信息，无法创建群组。';
    console.error("CreateGroupModal: 当前用户ID或用户名未从 authStore 中获取。");
    return;
  }

  // 4. 构建最终的 userIds 和 usernames 列表，确保包含创建者
  const finalUserIdsSet = new Set<number>(selectedMemberIds.value); // 用 Set 去重，并从用户选择的开始
  finalUserIdsSet.add(currentUserId); // 添加当前用户 (创建者)

  const finalUserIds = Array.from(finalUserIdsSet);
  const finalUsernames: string[] = [];

  for (const id of finalUserIds) {
    if (id === currentUserId) {
      finalUsernames.push(currentUsername); // 当前用户的用户名
    } else {
      // 对于其他选中的成员，从传入的 friends 列表中查找名字
      const friend = availableFriends.value.find(f => f.id === id);
      if (friend) {
        finalUsernames.push(friend.name);
      } else {
        // 如果在 friends 列表中找不到（理论上不应该，因为是从列表选的），提供一个回退名
        console.warn(`用户ID ${id} 的名称未在可用好友列表中找到，使用回退名称。`);
        finalUsernames.push(`用户${id}`);
      }
    }
  }

  // 5. 发射 'create' 事件，包含处理过的群组数据
  emit('create', {
    groupName: groupName.value.trim(),
    userIds: finalUserIds,
    usernames: finalUsernames, // 这个 usernames 列表现在与 finalUserIds 对应并包含创建者
  });
};
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    max-width: 500px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  .form-group input[type="text"] {
    width: calc(100% - 16px);
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .member-selection {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .member-selection input[type="checkbox"] {
    margin-right: 8px;
  }
  .modal-actions button {
    margin-right: 10px;
    padding: 8px 15px;
  }
  .error-message {
    color: red;
    font-size: 0.9em;
    margin-top: 10px;
  }
  </style>