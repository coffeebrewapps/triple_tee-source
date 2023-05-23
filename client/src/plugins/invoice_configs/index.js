const route = {
  path: '/invoice_configs',
  name: 'Invoice Configs',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
