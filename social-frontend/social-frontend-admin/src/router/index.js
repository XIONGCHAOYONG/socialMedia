import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Users from '@/views/Users.vue'
import Groups from '@/views/Groups.vue'
import Posts from '@/views/Posts.vue'
import Tags from '@/views/Tags.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: { requiresAuth: true }
    },
    {
      path: '/groups',
      name: 'groups',
      component: Groups,
      meta: { requiresAuth: true }
    },
    {
      path: '/posts',
      name: 'posts',
      component: Posts,
      meta: { requiresAuth: true }
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
      meta: { requiresAuth: true }
    }
  ],
})

/**
 * 路由守卫 - 检查用户登录状态
 */
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router
