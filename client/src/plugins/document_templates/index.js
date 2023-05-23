const route = {
  path: '/document_templates',
  name: 'Document Templates',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
