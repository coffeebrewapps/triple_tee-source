import { useStore } from './store'

const route = {
  path: '/invoices',
  name: 'Invoices',
  component: () => import('./Invoices.vue')
}

const viewInvoiceRoute = {
  path: '/invoices/:id',
  name: 'View Invoice',
  component: () => import('./ViewInvoice.vue'),
  meta: {
    parentRoute: { name: 'Invoices' },
    hidden: true
  }
}

const createInvoiceRoute = {
  path: '/invoices',
  name: 'Create Invoice',
  component: () => import('./CreateInvoice.vue'),
  meta: {
    parentRoute: { name: 'Invoices' },
    hidden: true
  }
}

const usePlugin = (router, dataStore) => {
  const store = useStore(dataStore)

  router.addRoute(route)
  router.addRoute(viewInvoiceRoute)
  router.addRoute(createInvoiceRoute)

  dataStore.registerFunction('invoices', 'create', 'generate_with_lines', store.createWithLines)
  dataStore.registerFunction('invoices', 'create', 'preview_invoice', store.previewInvoice)
  dataStore.registerFunction('invoices', 'view', 'template_data', store.viewTemplateData)

  return route
}

export default usePlugin
