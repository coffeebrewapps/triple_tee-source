import { useRouter } from 'vue-router'

const route = {
  path: '/document_templates',
  name: 'Document Templates',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
