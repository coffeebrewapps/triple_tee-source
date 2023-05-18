import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Inbox',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/admin',
    name: 'Data Admin',
    component: () => import('../views/DataAdmin.vue')
  }
]

const plugins = import.meta.glob('@/plugins/**/*.js', { import: 'default', eager: true })
Object.keys(plugins).forEach((plugin) => {
  const route = plugins[plugin]()
  routes.push(route)
  console.log(`Installed plugin ${plugin}`)
})

routes.push(
  {
    path: '/:catchAll(.*)',
    redirect: '/',
    meta: { hidden: true }
  }
)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
