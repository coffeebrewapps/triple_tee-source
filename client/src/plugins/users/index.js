import { useRouter } from 'vue-router'

const route = {
  path: '/users',
  name: 'users',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
