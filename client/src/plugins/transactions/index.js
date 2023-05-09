import { useRouter } from 'vue-router'

const route = {
  path: '/transactions',
  name: 'Transactions',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
