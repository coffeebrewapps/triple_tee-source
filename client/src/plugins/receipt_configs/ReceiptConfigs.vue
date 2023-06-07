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
  >
    <template #header-row>
      <th />
    </template>

    <template #data-content="{ row, inputValue }">
      <td class="col">
        <div class="content-row">
          <div class="highlight">
            {{ inputValue('description', row) }}
          </div>
          <div class="small">
            {{ inputValue('receiptNumberSequenceId', row) }}
          </div>
          <div class="small">
            {{ inputValue('receiptTemplateId', row) }}
          </div>
        </div>
      </td>
    </template>
  </DataPage>
</template>

<style scoped>
.col {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
}

.content-row {
  display: flex;
  flex-direction: column;
}

.highlight {
  font-weight: 900;
}

.small {
  font-size: 0.8rem;
}
</style>
