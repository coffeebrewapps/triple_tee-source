import { useRouter } from 'vue-router'

const route = {
  path: '/transactions',
  name: 'transactions',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
