const route = {
  path: '/invoices',
  name: 'Invoices',
  component: () => import('./view.vue')
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

const usePlugin = (router) => {
  router.addRoute(route)
  router.addRoute(viewInvoiceRoute)
  router.addRoute(createInvoiceRoute)
  return route
}

export default usePlugin
