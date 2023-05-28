import { computed } from 'vue'

import useConfig from '@/config'
const config = useConfig()

import { useValidations } from '@/utils/validations'
const {
  notEarlierThan,
  greaterThanOrEqual
} = useValidations()

export function useInvoiceUtils() {
  const worklogsUrl = `${config.baseUrl}/api/work_logs`
  const invoicesUrl = `${config.baseUrl}/api/invoices`
  const invoiceLinesUrl = `${config.baseUrl}/api/invoice_lines`
  const contactsUrl = `${config.baseUrl}/api/contacts`
  const currenciesUrl = `${config.baseUrl}/api/currencies`
  const invoiceConfigsUrl = `${config.baseUrl}/api/invoice_configs`
  const templatesUrl = `${config.baseUrl}/api/invoice_templates`
  const tagsUrl = `${config.baseUrl}/api/tags`

  const fieldsLayout = [
    { invoiceNumber: 'lg' },
    { invoiceDate: 'md', dueDate: 'md', totalAmount: 'md' },
    { customFields: 'lg' },
    { invoiceConfigId: 'lg' },
    { currencyId: 'lg' },
    { contactId: 'lg' }
  ]

  function generateDataFields(contactId) {
    return [
      { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
      { key: 'invoiceNumber', type: 'text', label: 'Invoice Number', listable: true, viewable: true, creatable: true, updatable: false, filterable: true, sortable: true },
      { key: 'invoiceDate', type: 'date', label: 'Invoice Date', listable: true, viewable: true, creatable: true, updatable: true, sortable: true },
      { key: 'dueDate', type: 'date', label: 'Due Date', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'totalAmount', type: 'number', label: 'Total Amount', listable: true, viewable: true, creatable: true, updatable: true },
      { key: 'customFields', type: 'object', label: 'Custom Fields', listable: true, viewable: true, creatable: true, updatable: true },
      {
        key: 'invoiceConfigId', type: 'singleSelect', label: 'Invoice Config',
        reference: { label: invoiceConfigLabel },
        listable: false, viewable: true, creatable: true, updatable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'invoice_configs',
          sourceUrl: invoiceConfigsUrl,
          value: recordValue,
          label: invoiceConfigLabel
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
          sourceUrl: currenciesUrl,
          value: recordValue,
          label: currencyLabel
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
          sourceUrl: contactsUrl,
          value: recordValue,
          label: contactLabel
        }
      }
    ]
  }

  function recordValue(record) {
    return record.id
  }

  function tagLabel(record) {
    return `${record.category}:${record.name}`
  }

  function invoiceConfigLabel(record) {
    return record.description
  }

  function currencyLabel(record) {
    return `${record.code} (${record.symbol})`
  }

  function contactLabel(record) {
    return record.name
  }

  const validations = {
    create: {
      dueDate: [
        validateDueDate
      ],
      totalAmount: [
        (record) => { return greaterThanOrEqual(record, 'totalAmount', 0) }
      ]
    },
    update: {
      dueDate: [
        validateDueDate
      ],
      totalAmount: [
        (record) => { return greaterThanOrEqual(record, 'totalAmount', 0) }
      ]
    }
  }

  function validateDueDate(record) {
    return notEarlierThan(record, 'dueDate', 'invoiceDate')
  }

  function generateFilters(contactId) {
    const initData = {}

    if (contactId) {
      initData.contactId = [{ value: contactId }]
    }

    initData.invoiceNumber = null

    return {
      initData,
      layout: [
        { contactId: 'lg', invoiceNumber: 'lg' }
      ]
    }
  }

  return {
    worklogsUrl,
    invoicesUrl,
    invoiceLinesUrl,
    contactsUrl,
    currenciesUrl,
    invoiceConfigsUrl,
    templatesUrl,
    tagsUrl,
    fieldsLayout,
    generateDataFields,
    recordValue,
    tagLabel,
    invoiceConfigLabel,
    currencyLabel,
    contactLabel,
    validations,
    generateFilters
  }
}
