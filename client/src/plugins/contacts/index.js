import { useStore } from './store';
import { useValidations } from '@/utils/validations';

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
    displayName: (route) => {
      if (route.params) {
        return `Contact #${route.params.contactId}`;
      } else {
        return route.name;
      }
    },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Details`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Invoice Configs`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Receipt Configs`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Billing Configs`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Invoices`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Receipts`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Create Invoice`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Invoice #${route.params.invoiceId}`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Create Receipt`;
          } else {
            return route.name;
          }
        },
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
        displayName: (route) => {
          if (route.params) {
            return `Contact #${route.params.contactId} Receipt #${route.params.receiptId}`;
          } else {
            return route.name;
          }
        },
      },
    },
  ],
};

const usePlugin = ({ router, dataStore, uploader, logger }) => {
  const utils = useValidations();
  const store = useStore({ dataStore, uploader, utils, logger });

  router.addRoute(route);
  router.addRoute(viewContactRoute);

  dataStore.registerFunction('contacts', 'create', 'create', store.createWithUpload);
  dataStore.registerFunction('contacts', 'update', 'update', store.updateWithUpload);
};

export default usePlugin;
