<script setup>
import { computed } from 'vue';
import { useValidations } from '@/utils/validations';
import DataPage from '@/components/DataPage.vue';

const { greaterThan } = useValidations();

const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});

const fieldsLayout = [
  { description: 'lg' },
  { invoiceCycleDurationValue: 'md', invoiceCycleDurationUnit: 'md' },
  { dueDateCycleValue: 'md', dueDateCycleUnit: 'md' },
  { paymentTerms: 'lg' },
  { tags: 'lg' },
  { customFields: 'lg' },
  { invoiceNumberSequenceId: 'lg' },
  { billingContactId: 'lg' },
  { invoiceTemplateId: 'lg' },
  { currencyId: 'lg' },
];

const dataFields = computed(() => {
  return [
    {
      key: 'id',
      type: 'text',
      label: 'ID',
      listable: true,
      viewable: true,
      creatable: false,
      updatable: false,
      sortable: true,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Description',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'invoiceCycleDurationValue',
      type: 'number',
      label: 'Invoice Cycle Duration Value',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'invoiceCycleDurationUnit',
      type: 'enum',
      label: 'Invoice Cycle Duration Unit',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'dueDateCycleValue',
      type: 'number',
      label: 'Due Date Cycle Value',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'dueDateCycleUnit',
      type: 'enum',
      label: 'Due Date Cycle Unit',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'paymentTerms',
      type: 'text',
      label: 'Payment Terms',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'tags',
      type: 'multiSelect',
      label: 'Tags',
      reference: { label: tagLabel },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'tags',
        value: recordValue,
        label: tagLabel,
      },
    },
    {
      key: 'customFields',
      type: 'object',
      label: 'Custom Fields (JSON)',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'invoiceNumberSequenceId',
      type: 'singleSelect',
      label: 'Sequence Number',
      reference: { label: sequenceNumberLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: false,
      options: {
        server: true,
        pagination: true,
        modelClass: 'sequences',
        value: recordValue,
        label: sequenceNumberLabel,
      },
    },
    {
      key: 'billingContactId',
      type: 'singleSelect',
      label: 'Contact',
      reference: { label: contactLabel },
      defaultValue: () => { return props.contactId; },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
      filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        value: recordValue,
        label: contactLabel,
      },
    },
    {
      key: 'invoiceTemplateId',
      type: 'singleSelect',
      label: 'Template',
      reference: { label: templateLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'invoice_templates',
        value: recordValue,
        label: templateLabel,
      },
    },
    {
      key: 'currencyId',
      type: 'singleSelect',
      label: 'Currency',
      reference: { label: currencyLabel },
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'currencies',
        value: recordValue,
        label: currencyLabel,
      },
    },
  ];
});

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

const validations = {
  create: {
    invoiceCycleDurationValue: [
      (record) => { return greaterThan(record, 'invoiceCycleDurationValue', 0); },
    ],
    dueDateCycleValue: [
      (record) => { return greaterThan(record, 'dueDateCycleValue', 0); },
    ],
  },
};

const filters = computed(() => {
  const initData = {};

  if (props.contactId) {
    initData.billingContactId = [{ value: props.contactId }];
  }

  return {
    initData,
    layout: [
      { billingContactId: 'lg' },
    ],
  };
});

function recordValue(record) {
  return record.id;
}

function tagLabel(record) {
  return `${record.category}:${record.name}`;
}

function sequenceNumberLabel(record) {
  return record.name;
}

function contactLabel(record) {
  return record.name;
}

function templateLabel(record) {
  return record.name;
}

function currencyLabel(record) {
  return `${record.code} (${record.symbol})`;
}
</script>

<template>
  <DataPage
    model-class="invoice_configs"
    data-type="Invoice Configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #[`highlight.description`]="{ formattedValue }">
      {{ formattedValue }}
    </template>

    <template #[`data-col.currencyId`]="{ formattedValue }">
      Chargeable in <strong>{{ formattedValue }}</strong>
    </template>

    <template #[`data-col.invoiceCycleDurationValue`]="{ row, formattedValue, inputValue }">
      Billed every
      <strong>{{ formattedValue }} {{ inputValue('invoiceCycleDurationUnit', row) }}</strong>
    </template>

    <template #[`data-col.dueDateCycleValue`]="{ row, formattedValue, inputValue }">
      Due in
      <strong>{{ formattedValue }} {{ inputValue('dueDateCycleUnit', row) }}</strong>
      from Invoice Date
    </template>
  </DataPage>
</template>
