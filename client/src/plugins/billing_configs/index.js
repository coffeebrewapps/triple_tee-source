import { useRouter } from 'vue-router'

const route = {
  path: '/billing_configs',
  name: 'Billing Configs',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
