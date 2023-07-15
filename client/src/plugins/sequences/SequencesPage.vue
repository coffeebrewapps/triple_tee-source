<script setup>
import { useValidations } from '@/utils/validations';
import DataPage from '@/components/DataPage.vue';

const { greaterThan, greaterThanOrEqual } = useValidations();

const fieldsLayout = [
  { name: 'md' },
  { prefix: 'sm', startingNumber: 'md', suffix: 'sm', incrementStep: 'sm' },
];

const dataFields = [
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
    key: 'name',
    type: 'text',
    label: 'Name',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
  {
    key: 'startingNumber',
    type: 'number',
    label: 'Starting Number',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'lastUsedNumber',
    type: 'number',
    label: 'Last Used Number',
    listable: true,
    viewable: true,
    creatable: false,
    updatable: false,
  },
  {
    key: 'incrementStep',
    type: 'number',
    label: 'Increment Step',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'prefix',
    type: 'text',
    label: 'Prefix',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
  {
    key: 'suffix',
    type: 'text',
    label: 'Suffix',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
];

const validations = {
  create: {
    startingNumber: [
      (record) => { return greaterThanOrEqual(record, 'startingNumber', 0); },
    ],
    incrementStep: [
      (record) => { return greaterThan(record, 'incrementStep', 0); },
    ],
  },
};

const filters = {
  initData: {},
  layout: [
    { name: 'md', prefix: 'md', suffix: 'md' },
  ],
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'name',
};

function formatSequenceNumber(row, field) {
  const parts = [];

  if (row.prefix) {
    parts.push(row.prefix);
  }

  parts.push(field.toString().padStart(6, '0'));

  if (row.suffix) {
    parts.push(row.suffix);
  }

  return parts.join('-');
}
</script>

<template>
  <DataPage
    model-class="sequences"
    data-type="Sequences"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #[`data-col.lastUsedNumber`]="{ row }">
      Last <strong>{{ formatSequenceNumber(row, row.lastUsedNumber) }}</strong>
    </template>

    <template #[`data-col.incrementStep`]="{ row }">
      Next <strong>{{ formatSequenceNumber(row, (row.lastUsedNumber + row.incrementStep)) }}</strong>
    </template>
  </DataPage>
</template>
