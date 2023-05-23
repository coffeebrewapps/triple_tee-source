const route = {
  path: '/sequences',
  name: 'Sequences',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
