import { useRouter } from 'vue-router'

const route = {
  path: '/sequences',
  name: 'Sequences',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
