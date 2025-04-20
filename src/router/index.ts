/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 13:20:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-04-20 14:40:13
 * @FilePath: \internet2\chatroomreal\src\router\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import Login from '../components/Login.vue';  // 引入 Login 组件
import Register from '../components/Register.vue';  // 引入 Register 组件

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/login',
      name: 'login',  // 登录页面
      component: Login,
    },
    {
      path: '/register',
      name: 'register',  // 注册页面
      component: Register,
    },

    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

  ],
})

export default router
