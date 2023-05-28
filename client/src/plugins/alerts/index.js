const route = {
  path: '/alerts',
  name: 'Alerts',
  component: () => import('./Alerts.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
