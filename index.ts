import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ChatArea from '@/views/ChatArea.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/chat',
  },
  {
    path: '/chat',
    component: ChatArea,
    children: [
      {
        path: ':type(friend|group)/:id',
        name: 'chat',
        component: () => import('@/components/ChatPage.vue'),
        props: (route) => ({
          type: route.params.type as 'friend' | 'group', // 严格类型
          target: route.params.id as string,             // 对应 ChatPage 的 prop 名
        }),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;