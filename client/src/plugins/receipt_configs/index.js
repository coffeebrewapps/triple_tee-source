const route = {
  path: '/receipt_configs',
  name: 'Receipt Configs',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
