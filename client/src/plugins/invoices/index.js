const route = {
  path: '/invoices',
  name: 'Invoices',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
