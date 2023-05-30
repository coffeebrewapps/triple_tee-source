const route = {
  path: '/work_logs',
  name: 'Work Logs',
  component: () => import('./WorkLogs.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
