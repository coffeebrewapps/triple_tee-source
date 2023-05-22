import { useRouter } from 'vue-router'

const route = {
  path: '/invoice_configs',
  name: 'Invoice Configs',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
