const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./Transactions.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
