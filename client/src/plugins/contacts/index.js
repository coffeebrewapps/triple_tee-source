import { useStore } from './store';

const route = {
  path: '/contacts',
  name: 'Contacts',
  component: () => import('./ContactsPage.vue'),
};

const viewContactRoute = {
  path: '/contacts/:contactId',
  name: 'View Contact',
  component: () => import('./ViewContact.vue'),
  props: true,
  meta: {
    parentRoute: { name: 'Contacts' },
    hidden: true,
  },
  children: [
    {
      path: '',
      name: 'Contact Details',
      component: () => import('./ContactDetails.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'invoice_configs',
      name: 'Contact Invoice Configs',
      component: () => import('@/plugins/invoice_configs/InvoiceConfigs.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'receipt_configs',
      name: 'Contact Receipt Configs',
      component: () => import('@/plugins/receipt_configs/ReceiptConfigs.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'billing_configs',
      name: 'Contact Billing Configs',
      component: () => import('@/plugins/billing_configs/BillingConfigs.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'invoices',
      name: 'Contact Invoices',
      component: () => import('@/plugins/invoices/InvoicesPage.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'receipts',
      name: 'Contact Receipts',
      component: () => import('@/plugins/receipts/ReceiptsPage.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contacts' },
        hidden: true,
      },
    },
    {
      path: 'invoices/new',
      name: 'Contact Create Invoice',
      component: () => import('@/plugins/invoices/CreateInvoice.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contact Invoices' },
        hidden: true,
      },
    },
    {
      path: 'invoices/:invoiceId',
      name: 'Contact View Invoice',
      component: () => import('@/plugins/invoices/ViewInvoice.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contact Invoices' },
        hidden: true,
      },
    },
    {
      path: 'receipts/new',
      name: 'Contact Create Receipt',
      component: () => import('@/plugins/receipts/CreateReceipt.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contact Receipts' },
        hidden: true,
      },
    },
    {
      path: 'receipts/:receiptId',
      name: 'Contact View Receipt',
      component: () => import('@/plugins/receipts/ViewReceipt.vue'),
      props: true,
      meta: {
        parentRoute: { name: 'Contact Receipts' },
        hidden: true,
      },
    },
  ],
};

const usePlugin = (router, dataStore, uploader) => {
  const store = useStore(dataStore, uploader);

  router.addRoute(route);
  router.addRoute(viewContactRoute);

  dataStore.registerFunction('contacts', 'create', 'create', store.createWithUpload);
  dataStore.registerFunction('contacts', 'update', 'update', store.updateWithUpload);

  return route;
};

export default usePlugin;
