const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
