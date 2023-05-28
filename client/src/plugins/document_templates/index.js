import { useStore } from './store'

const route = {
  path: '/document_templates',
  name: 'Document Templates',
  component: () => import('./DocumentTemplates.vue')
}

const createTemplateRoute = {
  path: '/document_templates/:templateType',
  name: 'Create Template',
  component: () => import('./NewTemplate.vue'),
  meta: {
    parentRoute: { name: 'Document Templates' },
    hidden: true
  }
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

const usePlugin = (router, dataStore) => {
  const store = useStore(dataStore)

  router.addRoute(route)
  router.addRoute(createTemplateRoute)
  router.addRoute(viewTemplateRoute)
  router.addRoute(updateTemplateRoute)

  dataStore.registerFunction('invoice_templates', 'downloadStream', 'pdf', store.downloadPdf)

  return route
}

export default usePlugin
