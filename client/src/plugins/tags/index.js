const route = {
  path: '/tags',
  name: 'Tags',
  component: () => import('./TagsPage.vue'),
};

const usePlugin = (router) => {
  router.addRoute(route);
  return route;
};

export default usePlugin;
