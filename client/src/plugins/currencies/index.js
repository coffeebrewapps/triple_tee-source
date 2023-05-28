const route = {
  path: '/currencies',
  name: 'Currencies',
  component: () => import('./Currencies.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
