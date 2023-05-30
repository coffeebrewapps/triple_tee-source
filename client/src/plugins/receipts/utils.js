import { computed } from 'vue'

import { useValidations } from '@/utils/validations'
const {
  greaterThan,
  greaterThanOrEqual
} = useValidations()

import { useFormatter } from '@/utils/formatter'
const {
  formatDate
} = useFormatter()

export function useReceiptUtils() {
  const fieldsLayout = [
    { receiptNumber: 'md', receiptDate: 'md' },
    { billableAmount: 'md', paidAmount: 'md', paymentAmount: 'md', remainingAmount: 'md' },
    { customFields: 'lg' },
    { incomeReceiptConfigId: 'lg' },
    { invoiceId: 'lg' },
    { currencyId: 'lg' },
    { incomeTransactionId: 'lg' },
    { contactId: 'lg' }
  ]

  function generateDataFields(invoiceId, contactId) {
    return [
      { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
      { key: 'receiptNumber', type: 'text', label: 'Receipt Number', listable: true, viewable: true, creatable: false, updatable: false, filterable: true, sortable: true },
      { key: 'receiptDate', type: 'date', label: 'Receipt Date', listable: true, viewable: true, creatable: true, updatable: true, sortable: true },
      { key: 'billableAmount', type: 'number', label: 'Billable Amount', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'paidAmount', type: 'number', label: 'Paid Amount', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'paymentAmount', type: 'number', label: 'Payment Amount', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'remainingAmount', type: 'number', label: 'Remaining Amount', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'customFields', type: 'object', label: 'Custom Fields', listable: true, viewable: true, creatable: true, updatable: true },
      {
        key: 'incomeReceiptConfigId', type: 'singleSelect', label: 'Receipt Config',
        reference: { label: receiptConfigLabel },
        listable: false, viewable: true, creatable: true, updatable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'receipt_configs',
          value: recordValue,
          label: receiptConfigLabel
        }
      },
      {
        key: 'invoiceId', type: 'singleSelect', label: 'Invoice',
        reference: { label: invoiceLabel }, defaultValue: () => { return invoiceId },
        listable: false, viewable: true, creatable: true, updatable: false, filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'invoices',
          value: recordValue,
          label: invoiceLabel
        }
      },
      {
        key: 'currencyId', type: 'singleSelect', label: 'Currency',
        reference: { label: currencyLabel },
        listable: false, viewable: true, creatable: true, updatable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'currencies',
          value: recordValue,
          label: currencyLabel
        }
      },
      {
        key: 'incomeTransactionId', type: 'singleSelect', label: 'Transaction',
        reference: { label: transactionLabel },
        listable: false, viewable: true, creatable: false, updatable: false,
        options: {
          server: true,
          pagination: true,
          modelClass: 'transactions',
          value: recordValue,
          label: transactionLabel
        }
      },
      {
        key: 'contactId', type: 'singleSelect', label: 'Contact',
        reference: { label: contactLabel }, defaultValue: () => { return contactId },
        listable: true, viewable: true, creatable: true, updatable: false, filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'contacts',
          value: recordValue,
          label: contactLabel
        }
      }
    ]
  }

  function recordValue(record) {
    return record.id
  }

  function receiptConfigLabel(record) {
    return record.description
  }

  function invoiceLabel(record) {
    return `Invoice ${record.invoiceNumber} (${formatDate(record.invoiceDate)})`
  }

  function currencyLabel(record) {
    return `${record.code} (${record.symbol})`
  }

  function transactionLabel(record) {
    return record.description
  }

  function contactLabel(record) {
    return record.name
  }

  const validations = {
    create: {
      billableAmount: [
        (record) => { return greaterThan(record, 'billableAmount', 0) }
      ],
      paidAmount: [
        (record) => { return greaterThan(record, 'paidAmount', 0) }
      ],
      paymentAmount: [
        (record) => { return greaterThan(record, 'paymentAmount', 0) }
      ],
      remainingAmount: [
        (record) => { return greaterThanOrEqual(record, 'remainingAmount', 0) }
      ]
    },
    update: {
      billableAmount: [
        (record) => { return greaterThan(record, 'billableAmount', 0) }
      ],
      paidAmount: [
        (record) => { return greaterThan(record, 'paidAmount', 0) }
      ],
      paymentAmount: [
        (record) => { return greaterThan(record, 'paymentAmount', 0) }
      ],
      remainingAmount: [
        (record) => { return greaterThanOrEqual(record, 'remainingAmount', 0) }
      ]
    }
  }

  function generateFilters(invoiceId, contactId) {
    const initData = {}

    if (invoiceId) {
      initData.invoiceId = [{ value: invoiceId }]
    }

    if (contactId) {
      initData.contactId = [{ value: contactId }]
    }

    initData.receiptNumber = null

    return {
      initData,
      layout: [
        { receiptNumber: 'lg' },
        { invoiceId: 'lg', contactId: 'lg' }
      ]
    }
  }

  return {
    fieldsLayout,
    generateDataFields,
    recordValue,
    receiptConfigLabel,
    invoiceLabel,
    currencyLabel,
    transactionLabel,
    contactLabel,
    validations,
    generateFilters
  }
}
