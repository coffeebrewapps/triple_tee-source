<script setup>
import { useValidations } from '@/utils/validations';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import DataPage from '@/components/DataPage.vue';

const { notEarlierThan, greaterThan } = useValidations();
const systemConfigsStore = useSystemConfigsStore();

const fieldsLayout = [
  { code: 'md', symbol: 'md', exchangeRate: 'md' },
  { effectiveStart: 'md', effectiveEnd: 'md' },
];

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
    key: 'code',
    type: 'text',
    label: 'Code',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
  {
    key: 'symbol',
    type: 'text',
    label: 'Symbol',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'exchangeRate',
    type: 'number',
    label: 'Exchange Rate',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'effectiveStart',
    type: 'date',
    label: 'Effectve Start',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'effectiveEnd',
    type: 'date',
    label: 'Effectve End',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
];

const filters = {
  initData: {
    effectiveStart: {
      startDate: null,
      endDate: null,
    },
    effectiveEnd: {
      startDate: null,
      endDate: null,
    },
  },
  layout: [
    { code: 'md' },
    { effectiveStart: 'md', effectiveEnd: 'md' },
  ],
};

const validations = {
  create: {
    exchangeRate: [
      validateExchangeRate,
    ],
    effectiveEnd: [
      validateEffectiveEnd,
    ],
  },
  update: {
    exchangeRate: [
      validateExchangeRate,
    ],
    effectiveEnd: [
      validateEffectiveEnd,
    ],
  },
};

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart');
}

function validateExchangeRate(record) {
  return greaterThan(record, 'exchangeRate', 0);
}

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'code',
};

function sameAsBaseCurrency(row) {
  const systemConfigs = systemConfigsStore.getSystemConfigs();
  const baseCurrency = systemConfigs.includes.baseCurrencyId[systemConfigs.baseCurrencyId];
  return baseCurrency && baseCurrency.code === row.code;
}

function latestCurrency(row) {
  return (new Date()) >= (new Date(row.effectiveStart));
}
</script>

<template>
  <DataPage
    model-class="currencies"
    data-type="Currencies"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #[`highlight.code`]="{ row, formattedValue }">
      <div class="align-middle">
        <strong>{{ formattedValue }} ({{ row.symbol }})</strong>
        <span
          v-if="sameAsBaseCurrency(row)"
          class="tag inline"
        >Base</span>
        <span
          v-if="latestCurrency(row)"
          class="tag inline"
        >Latest</span>
      </div>
    </template>

    <template #[`data-col.exchangeRate`]="{ formattedValue }">
      Exchange rate <strong>{{ formattedValue }}</strong>
    </template>

    <template #[`data-col.effectiveStart`]="{ row, formattedValue, inputValue }">
      Effective <strong>{{ formattedValue }}</strong>
      <span v-if="row.effectiveEnd"> - <strong>{{ inputValue('effectiveEnd', row) }}</strong></span>
      <span v-if="!row.effectiveEnd"> - <strong>present</strong></span>
    </template>
  </DataPage>
</template>

<style scoped>
.align-middle {
  display: flex;
  align-items: center;
}
</style>
