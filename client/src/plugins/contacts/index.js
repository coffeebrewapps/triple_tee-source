const route = {
  path: '/contacts',
  name: 'Contacts',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
