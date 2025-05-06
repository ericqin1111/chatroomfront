/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 13:20:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-05 01:31:43
 * @FilePath: \internet2\chatroomreal\src\router\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * 合并后的路由配置
 * 整合了两个原始文件的路由，并包含了身份验证守卫。
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue' // 引入用于异步（懒加载）组件的函数

// 定义所有路由，通过合并和调整两个文件的路由
const routes: Array<RouteRecordRaw> = [
  // --- 来自文件 1 的路由 (并可能根据文件 2 进行了调整) ---

  {
    path: '/login',
    name: 'Login', 
    component: defineAsyncComponent(() => import('@/components/Login.vue')),
  },
  {
    path:'/sidebar',
    name:'sidebar',
    component:(() => import('@/components/AppSidebar.vue')),
  },
  {
    path: '/register',
    name: 'register',
    component: defineAsyncComponent(() => import('@/views/Register.vue')),
  },
  {
    path: '/',
    name: 'home',
    component: defineAsyncComponent(() => import('@/views/Home.vue')),
  
  },
  // {
  //   path: '/chat',
  //   name: 'ChatLayout',
  //   component: defineAsyncComponent(() => import('@/components/ChatLayout.vue')),
  //   meta: { requiresAuth: true }, // 访问聊天区域需要身份验证
  //   children: [
  //     // 子路由
  //     {
  //       path: 'friend/:id(\\d+)', // 好友聊天，:id 是参数，(\\d+) 表示只匹配数字
  //       name: 'FriendChat',
  //       // 假设这里使用的 ChatArea 组件位于 @/components 目录下
  //       component: defineAsyncComponent(() => import('@/components/ChatArea.vue')),
  //       props: true, // 将路由参数 (:id) 作为 props 传递给 ChatArea 组件
  //     },
  //     {
  //       path: 'group/:id(\\d+)', // 群组聊天
  //       name: 'GroupChat',
  //       // 假设这里使用的 ChatArea 组件位于 @/components 目录下
  //       component: defineAsyncComponent(() => import('@/components/ChatArea.vue')),
  //       props: true, // 将路由参数 (:id) 作为 props 传递给 ChatArea 组件
  //     },
  //     // 注意: 文件 2 中独立的 '/ChatArea' 路由很可能是多余的，
  //     // 因为 ChatArea 组件已经在 ChatLayout 内部加载了。
  //     // 如果 '/ChatArea' 有其他特定用途，可以将其加回，
  //     // 但可能需要使用不同的名称和路径。
  //   ],
  // },

  {
    path: '/chat', // 父路由
    name: 'ChatLayout',
    component: () => import('@/components/ChatLayout.vue'), // 加载布局组件
    meta: { requiresAuth: true },
    // **不再需要 children 子路由来加载 ChatArea**
    // children: [
    //   { path: 'friend/:id(\\d+)', name: 'FriendChat', component: () => import('@/components/ChatArea.vue'), props: true },
    //   { path: 'group/:id(\\d+)', name: 'GroupChat', component: () => import('@/components/ChatArea.vue'), props: true }
    // ]
  },


  // --- 兜底路由 (来自文件 1) ---
  {
    // 将所有未匹配到的路径重定向到登录页
    path: '/:pathMatch(.*)*', // 匹配所有未定义的路径
    redirect: '/login', // 重定向目标，也可以是 '/' (首页)
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 History 模式
  routes, // 使用合并后的路由数组
})

// --- 导航守卫 (来自文件 1) ---
router.beforeEach((to, from, next) => {
  // 检查目标路由 (或其任何父路由) 是否需要身份验证
  // to.matched 是一个包含当前路由所有嵌套路径片段的路由记录数组
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // 检查用户是否已登录 (这里简单地检查 localStorage 中是否存在 'token')
  // '!!' 将值强制转换为布尔值 (存在则为 true, 不存在则为 false)
  const isAuthenticated = !!localStorage.getItem('token')
  console.log("isAuthunticated:"+isAuthenticated);

  if (requiresAuth && !isAuthenticated) {
    // 如果路由需要验证，但用户未登录
    // 则重定向到登录页
    next({
      name: 'Login', // 使用登录路由的名称
      // 将用户原本想访问的路径作为查询参数传递，方便登录后跳回
      query: { redirect: to.fullPath },
    })
  } 
  
  // else if ((to.name === 'Login' || to.name === 'register') && isAuthenticated) {
  //   // 可选逻辑: 如果用户已登录，但尝试访问登录或注册页面
  //   // 则将他们重定向到其他页面 (例如首页或聊天页)
  //   next({ name: 'home' }) // 重定向到首页
   else {
    // 其他所有情况 (无需验证 或 已登录且访问需验证页面)，正常放行
    next()
  }
})

// 导出配置好的 router 实例
export default router
