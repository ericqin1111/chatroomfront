<template>
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">添加好友</h3>
        <form @submit.prevent="submitRequest">
          <div class="form-group">
            <label for="friend-identifier">用户ID或昵称:</label>
            <input
              type="text"
              id="friend-identifier"
              v-model="identifier"
              placeholder="输入对方的ID或昵称"
              required
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              发送请求
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits } from 'vue';
  
  // Props
  const props = defineProps<{
    visible: boolean;
  }>();
  
  // Emits
  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'send-request', identifier: string): void;
  }>();
  
  const identifier = ref('');
  
  const closeModal = () => {
    emit('close');
    identifier.value = ''; // 关闭时清空输入
  };
  
  const submitRequest = () => {
    if (identifier.value.trim()) {
      emit('send-request', identifier.value.trim());
      // 可以在这里不清空，或者根据发送成功与否决定
      // closeModal(); // 或者在父组件处理完请求后再关闭
    }
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
    z-index: 1000; /*确保在最上层 */
  }
  
  .modal-content {
    background-color: white;
    padding: 25px 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 400px;
  }
  
  .modal-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.25rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: #555;
  }
  
  .form-group input {
    width: calc(100% - 20px); /* 减去 padding */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px; /* 按钮间距 */
    margin-top: 25px;
  }
  
  .btn {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .btn-primary {
    background-color: #0b57d0; /* 使用你 Tab 激活的颜色 */
    color: white;
  }
  .btn-primary:hover {
    background-color: #0a4cb0;
  }
  
  .btn-secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  .btn-secondary:hover {
    background-color: #d0d0d0;
  }
  </style>