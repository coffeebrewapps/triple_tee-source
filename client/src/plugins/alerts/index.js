import { useRouter } from 'vue-router'

const route = {
  path: '/alerts',
  name: 'Alerts',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
