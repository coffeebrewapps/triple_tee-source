import { useRouter } from 'vue-router'

const route = {
  path: '/invoice_templates',
  name: 'Invoice Templates',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
