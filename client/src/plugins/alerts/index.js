const route = {
  path: '/alerts',
  name: 'Alerts',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
