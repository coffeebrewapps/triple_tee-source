<script setup>
import { computed } from 'vue';
import DataPage from '@/components/DataPage.vue';

const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});

const fieldsLayout = [
  { description: 'lg' },
  { customFields: 'lg' },
  { receiptNumberSequenceId: 'lg' },
  { billingContactId: 'lg' },
  { receiptTemplateId: 'lg' },
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
      key: 'customFields',
      type: 'object',
      label: 'Custom Fields (JSON)',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'receiptNumberSequenceId',
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
      key: 'receiptTemplateId',
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
        modelClass: 'receipt_templates',
        value: recordValue,
        label: templateLabel,
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

function sequenceNumberLabel(record) {
  return record.name;
}

function contactLabel(record) {
  return record.name;
}

function templateLabel(record) {
  return record.name;
}
</script>

<template>
  <DataPage
    model-class="receipt_configs"
    data-type="Receipt Configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #highlight.description="{ formattedValue }">
      {{ formattedValue }}
    </template>
  </DataPage>
</template>
