const route = {
  path: '/system_logs',
  name: 'System Logs',
  component: () => import('@/plugins/system_logs/LogsPage.vue'),
  meta: {
    hidden: true,
  },
};

const usePlugin = (router, dataStore) => {
  router.addRoute(route);
};

export default usePlugin;
