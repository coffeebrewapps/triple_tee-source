import { useRouter } from 'vue-router'

const route = {
  path: '/tags',
  name: 'tags',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
