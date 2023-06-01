<script setup>
import { computed } from 'vue';
import DataPage from '@/components/DataPage.vue';
import { useValidations } from '@/utils/validations';

const {
  greaterThanOrEqual,
  compareMoreThan,
} = useValidations();

const props = defineProps({
  taxTableId: {
    type: String,
    default: null,
  },
});

const fieldsLayout = [
  { minIncome: 'md', maxIncome: 'md' },
  { maxPayableAmount: 'md', rate: 'md' },
  { taxTableId: 'lg' },
];

function recordValue(record) {
  return record.id;
}

function taxTableLabel(record) {
  return record.description;
}

const dataFields = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
    listable: true,
    viewable: false,
    creatable: false,
    updatable: false,
    sortable: true,
  },
  {
    key: 'minIncome',
    type: 'number',
    label: 'Minimum Income',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    sortable: true,
  },
  {
    key: 'maxIncome',
    type: 'number',
    label: 'Maximum Income',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'maxPayableAmount',
    type: 'number',
    label: 'Maximum Payable Amount',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'rate',
    type: 'number',
    label: 'Rate',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'taxTableId',
    type: 'singleSelect',
    label: 'Tax Table',
    reference: { label: taxTableLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tax_tables',
      value: recordValue,
      label: taxTableLabel,
    },
  },
];

const validations = {
  create: {
    maxIncome: [
      (record) => { return compareMoreThan(record, 'maxIncome', 'minIncome'); },
    ],
    maxPayableAmount: [
      (record) => { return greaterThanOrEqual(record, 'maxPayableAmount', 0); },
    ],
    rate: [
      (record) => { return greaterThanOrEqual(record, 'rate', 0); },
    ],
  },
  update: {
    maxIncome: [
      (record) => { return compareMoreThan(record, 'maxIncome', 'minIncome'); },
    ],
    maxPayableAmount: [
      (record) => { return greaterThanOrEqual(record, 'maxPayableAmount', 0); },
    ],
    rate: [
      (record) => { return greaterThanOrEqual(record, 'rate', 0); },
    ],
  },
}

const filters = computed(() => {
  const initData = {};

  if (props.taxTableId) {
    initData.taxTableId = [{ value: props.taxTableId }];
  }

  return {
    initData,
    layout: [
      { taxTableId: 'lg' },
    ],
  };
});

function formatRate(value) {
  return (value * 100).toFixed(2);
}
</script>

<template>
  <DataPage
    model-class="tax_tiers"
    data-type="Tax Tiers"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
  >
    <template #data-col.rate="{ row }">
      {{ formatRate(row.rate) }} %
    </template>
  </DataPage>
</template>
