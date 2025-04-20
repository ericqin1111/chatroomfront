<template>
    <div class="auth-container">
      <!-- 根据 currentPage 控制显示哪个组件 -->
      <component :is="currentPage" />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue'
  import Login from '../components/Login.vue' // 导入 Login 组件
  import Register from '../components/Register.vue' // 导入 Register 组件
  
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
  html, body {
    height: 100%;  /* 确保整个页面的高度为100% */
    margin: 0;     /* 清除浏览器的默认外边距 */
    padding: 0;    /* 清除默认内边距 */
    display: flex; /* 使用 flex 布局来填满页面 */
    justify-content: center; /* 水平居中 */
    align-items: center;     /* 垂直居中 */
  }
  
  .auth-container {
    display: flex;
    justify-content: center; /* 水平居中 */
    align-items: center;     /* 垂直居中 */
    height: 100vh;           /* 确保容器高度占满视口 */
    width: 100%;             /* 宽度占满视口 */
  }
  
  .auth-container > * {
    width: 100%;
    max-width: 400px; /* 设置最大宽度 */
  }
  </style>
  