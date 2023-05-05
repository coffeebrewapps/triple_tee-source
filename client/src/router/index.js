import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/Users.vue')
    },
    {
      path: '/form',
      name: 'form',
      // route level code-splitting
      // this generates a separate chunk (Profile.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/DemoForm.vue')
    },
    {
      path: '/',
      name: 'menu1',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu2',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu3',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu4',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu5',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu6',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu7',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu8',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu9',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu10',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu11',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu12',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'menu13',
      component: () => import('../views/Login.vue')
    }
  ]
})

export default router
