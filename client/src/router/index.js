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

const plugins = import.meta.glob('@/plugins/**/index.js', { import: 'default', eager: true })
Object.keys(plugins).forEach((plugin) => {
  const route = plugins[plugin](router)
  console.log(`Installed plugin ${plugin}`)
})

router.addRoute({
  path: '/:catchAll(.*)',
  redirect: '/',
  meta: { hidden: true }
})

export default router
