const route = {
  path: '/tags',
  name: 'Tags',
  component: () => import('./Tags.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
