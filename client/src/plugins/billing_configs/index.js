const route = {
  path: '/billing_configs',
  name: 'Billing Configs',
  component: () => import('./BillingConfigs.vue')
}

const usePlugin = (router) => {
  router.addRoute(route)
  return route
}

export default usePlugin
