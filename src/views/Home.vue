<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 14:37:34
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-05 00:06:12
 * @FilePath: \chatroomreal\src\views\Home.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="auth-container">
    <!-- 根据 currentPage 控制显示哪个组件 -->
    <component :is="currentPage" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Login from '../components/Login.vue' // 导入 Login 组件
import Register from './Register.vue' // 导入 Register 组件

export default defineComponent({
  name: 'Home',
  components: {
    Login,
    Register,
  },
  setup() {
    // 默认显示 Login 页面
    const currentPage = ref('Login')

    // 切换到注册页面
    const goToRegister = () => {
      currentPage.value = 'Register'
    }

    // 切换到登录页面
    const goToLogin = () => {
      currentPage.value = 'Login'
    }

    return { currentPage, goToRegister, goToLogin }
  },
})
</script>

<style scoped>
html,
body {
  height: 100%; /* 确保整个页面的高度为100% */
  margin: 0; /* 清除浏览器的默认外边距 */
  padding: 0; /* 清除默认内边距 */
  display: flex; /* 使用 flex 布局来填满页面 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.auth-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100vh; /* 确保容器高度占满视口 */
  width: 100%; /* 宽度占满视口 */
}

.auth-container > * {
  width: 100%;
  max-width: 400px; /* 设置最大宽度 */
}
</style>
