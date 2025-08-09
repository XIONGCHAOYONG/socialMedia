import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import chat from '@/components/Chat.vue'
import Contacts from '@/components/Contacts.vue'
import Moments from '@/components/Moments.vue'
import Home from '@/components/Home.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
    },
    {
      path: '/chat',
      name: 'chat',
      component: chat
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: Contacts
    },
    {
      path: '/moments',
      name: 'moments',
      component: Moments
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    }
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // 如果访问首页，直接放行（显示登录对话框）
  if (to.name === 'layout') {
    next();
    return;
  }

  // 如果没有token或用户信息，跳转到首页（显示登录对话框）
  if (!token || !user) {
    next('/');
    return;
  }
  // 如果当前路由是 /，直接放行
  if (to.path === '/') {
    next();
    return;
  }
  // 其他情况正常放行
  next();
})

// 兼容 vue-router 4 的写法
router.beforeEach((to, from, next) => {
  if (localStorage.getItem('token') && to.path === '/') {
    next('/chat');
  } else {
    next();
  }
});

export default router
