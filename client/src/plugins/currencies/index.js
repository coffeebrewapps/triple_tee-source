import { useRouter } from 'vue-router'

const route = {
  path: '/currencies',
  name: 'Currencies',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
