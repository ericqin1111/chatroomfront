/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 13:20:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-04-20 14:09:38
 * @FilePath: \internet2\chatroomreal\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';  // 引入 Element Plus 样式



const app = createApp(App)
if (import.meta.env.PROD) {
    (app.config as unknown as { devtools: boolean }).devtools = false
  }
app.config.globalProperties.$ws = null
app.config.globalProperties.$token = null
app.use(router)
app.use(ElementPlus)
app.mount('#app')
