import { useRouter } from 'vue-router'

const route = {
  path: '/work_logs',
  name: 'Work Logs',
  component: () => import('./view.vue')
}

const usePlugin = () => {
  return route
}

export default usePlugin
