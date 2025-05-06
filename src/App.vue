<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-04-20 13:20:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-05-06 19:01:37
 * @FilePath: \chatroomreal\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
// RouterView 通常是小写 'r' 开始，或者你上面导入了别名
import { RouterView } from 'vue-router'


// RouterLink 没有在模板中使用，可以移除导入
// import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style>
/* 使用全局样式或 scoped 均可，全局可能更适合整体布局 */
/* 确保 html, body, #app 占满高度，为居中提供基础 */
html, body {
   height: 100%;
   margin: 0;
   padding: 0;
   background-color: #f4f5f7; /* 整体背景色 */
 }

 #app { /* Vue 应用挂载点 (通常在 index.html) */
    height: 100%;
    width: 100%; /* 确保 #app 占满视口 */
    display: flex; /* 用 flex 来居中其直接子元素 (.app-container) */
    justify-content: center; /* 水平居中 */
    /* align-items: center; */ /* 垂直居中可能导致内容过长时显示不全，先去掉或用 stretch */
    align-items: stretch; /* 让子元素高度撑满 */
    box-sizing: border-box;
 }

 .app-container { /* App.vue 模板的根元素 */
   width: 100%; /* 继承 #app 的宽度 */
   height: 100%; /* 继承 #app 的高度 */
   display: flex; /* 内部也用 flex，方便管理 RouterView 输出 */
   box-sizing: border-box;
   /* 不在这里居中，因为 #app 已经负责居中了 */
 }

 /* 确保 RouterView 渲染出来的组件能撑满 .app-container */
 /* :deep() 穿透 scoped 样式，选中 RouterView 渲染出的直接子组件 */
 .app-container > :deep(*) {
    width: 100%;
    height: 100%;
    display: flex; /* 确保如 ChatLayout 这样的组件也是 flex 容器 */
    flex-direction: column; /* 如果需要的话，或者让组件自己决定 */
    box-sizing: border-box;
 }
</style>
