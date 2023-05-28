import { createRouter, createWebHistory } from 'vue-router'

const routes = []

const router = createRouter({
  mode: 'history',
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.addRoute({
  path: '/',
  name: 'Inbox',
  component: () => import('@/views/HomeView.vue')
})

router.addRoute({
  path: '/admin',
  name: 'Data Admin',
  component: () => import('@/views/DataAdmin.vue')
})

router.addRoute({
  path: '/:catchAll(.*)',
  redirect: '/',
  meta: { hidden: true }
})

export default router
