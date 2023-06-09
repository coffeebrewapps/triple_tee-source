const route = {
  path: '/alerts',
  name: 'Alerts',
  component: () => import('./AlertsPage.vue'),
  meta: {
    hidden: true,
  },
};

const usePlugin = ({ router }) => {
  router.addRoute(route);
};

export default usePlugin;
