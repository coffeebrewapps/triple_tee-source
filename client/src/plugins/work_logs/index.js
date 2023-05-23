const route = {
  path: '/work_logs',
  name: 'Work Logs',
  component: () => import('./view.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
