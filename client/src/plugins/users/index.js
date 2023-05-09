import { useRouter } from 'vue-router'

const route = {
  path: '/users',
  name: 'Users',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
