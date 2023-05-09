import { useRouter } from 'vue-router'

const route = {
  path: '/tags',
  name: 'Tags',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
