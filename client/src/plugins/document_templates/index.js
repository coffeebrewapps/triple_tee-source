const route = {
  path: '/document_templates',
  name: 'Document Templates',
  component: () => import('./view.vue')
}

const viewTemplateRoute = {
  path: '/document_templates/:templateType/:id',
  name: 'View Template',
  component: () => import('./PreviewTemplate.vue'),
  props: { disabled: true },
  meta: {
    parentRoute: { name: 'Document Templates' },
    hidden: true
  }
}

const updateTemplateRoute = {
  path: '/document_templates/:templateType/:id',
  name: 'Update Template',
  component: () => import('./PreviewTemplate.vue'),
  props: { disabled: false },
  meta: {
    parentRoute: { name: 'Document Templates' },
    hidden: true
  }
}

const usePlugin = (router) => {
  router.addRoute(route)
  router.addRoute(viewTemplateRoute)
  router.addRoute(updateTemplateRoute)
  return route
}

export default usePlugin
