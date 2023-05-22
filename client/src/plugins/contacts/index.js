import { useRouter } from 'vue-router'

const route = {
  path: '/contacts',
  name: 'Contacts',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
