/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-05-05 12:13:36
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-05 12:13:50
 * @FilePath: \chatroomreal\src\stores\auth.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token')) // 尝试从 localStorage 恢复 token
  const userId = ref<number | null>(JSON.parse(localStorage.getItem('userId') || 'null')) // 尝试恢复 userId
  const username = ref<string | null>(localStorage.getItem('username')) // 尝试恢复 username

  // Getters
  const isAuthenticated = computed(() => !!token.value) // 判断是否登录

  // Actions
  function loginSuccess(newToken: string, newUserId: number, newUsername: string) {
    token.value = newToken
    userId.value = newUserId
    username.value = newUsername
    // 同时存入 localStorage 以便持久化（或使用 pinia 持久化插件）
    localStorage.setItem('token', newToken)
    localStorage.setItem('userId', JSON.stringify(newUserId))
    localStorage.setItem('username', newUsername)
    console.log('[AuthStore] Login success, state updated.')
  }

  function logout() {
    token.value = null
    userId.value = null
    username.value = null
    // 从 localStorage 移除
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    console.log('[AuthStore] Logged out, state cleared.')
    // 可能还需要通知 chatStore 断开 WebSocket 等
    // useChatStore().disconnectWebSocket(); // 需要导入
  }

  return {
    token,
    userId,
    username,
    isAuthenticated,
    loginSuccess,
    logout,
  }
})
