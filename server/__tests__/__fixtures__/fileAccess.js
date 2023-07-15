const emptyModels = [
  'alerts',
  'billing_configs',
  'documents',
  'income_receipts',
  'invoice_configs',
  'invoice_lines',
  'invoice_templates',
  'invoices',
  'receipt_configs',
  'receipt_templates',
  'sequences',
  'tags',
  'tax_deductibles',
  'tax_tables',
  'tax_tiers',
  'transactions',
  'work_logs',
];

const prefilledModels = [
  'chart_configs',
  'contacts',
  'countries',
  'currencies',
  'system_configs',
];

const initIndexes = {
  unique: {},
  foreign: {},
  filter: {},
};

function initDataNoExisting() {
  return {
    indexes: initIndexes,
  };
}

function initDataHasExisting() {
  return {
    indexes: {
      unique: {
        contacts: {
          description: 'Coffee Brew Apps',
        },
      },
      foreign: {
        contacts: {
          1: {
            billing_configs: ['1'],
          },
        },
      },
      filter: {
        contacts: {
          description: {
            'Coffee Brew Apps': ['1'],
          },
        },
      },
    },
  };
}

module.exports = {
  emptyModels,
  prefilledModels,
  initIndexes,
  initDataNoExisting,
  initDataHasExisting,
};
