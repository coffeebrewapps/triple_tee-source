import { createRouter, createWebHistory } from 'vue-router';

const routes = [];

const router = createRouter({
  mode: 'history',
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.addRoute({
  path: '/',
  name: 'Home',
  component: () => import('@/views/HomeView.vue'),
  meta: {
    hidden: true,
    displayName: (route) => {
      return 'Dashboard';
    },
  },
});

router.addRoute({
  path: '/inbox',
  name: 'Inbox',
  component: () => import('@/views/InboxPage.vue'),
  meta: {
    hidden: true,
  },
});

router.addRoute({
  path: '/admin',
  name: 'Data Admin',
  component: () => import('@/views/DataAdmin.vue'),
  meta: {
    hidden: true,
  },
});

router.addRoute({
  path: '/:catchAll(.*)',
  redirect: '/',
  meta: { hidden: true },
});

export default router;
