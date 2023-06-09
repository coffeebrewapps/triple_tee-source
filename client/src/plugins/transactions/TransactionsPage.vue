<script setup>
import { ref, computed } from 'vue';
import DataPage from '@/components/DataPage.vue';
import { useFormatter } from '@/utils/formatter';
import { useDataAccess } from '@/utils/dataAccess';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import {
  TConfirmDialog
} from 'coffeebrew-vue-components';
import { useEventsStore } from '@/stores/events';
import { useBannerStore } from '@/stores/banner';

const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();
const baseCurrency = computed(() => {
  return systemConfigs.includes.baseCurrencyId[systemConfigs.baseCurrencyId];
});

const {
  formatDate,
} = useFormatter();

const { flashMessage } = useBannerStore();
const dataAccess = useDataAccess();
const events = useEventsStore();

const fieldsLayout = [
  { type: 'lg', transactionDate: 'md' },
  { description: 'lg' },
  { currencyId: 'md', amount: 'md', homeCurrencyAmount: 'md' },
  { tags: 'lg' },
  { associatedTransactionId: 'lg' },
];

function recordValue(record) {
  return record.id;
}

function tagLabel(record) {
  return `${record.category}:${record.name}`;
}

function currencyLabel(record) {
  const startDate = formatDate(record.effectiveStart, systemConfigs.timezone);
  const endDate = formatDate(record.effectiveEnd, systemConfigs.timezone);

  let label = `${record.code}`;
  label = label.concat(` (${startDate}`);

  if (endDate) {
    label = label.concat(` - ${endDate})`);
  } else {
    label = label.concat(` - present)`);
  }

  return label;
}

function transactionLabel(record) {
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
    key: 'type',
    type: 'enum',
    label: 'Type',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
  },
  {
    key: 'transactionDate',
    type: 'date',
    label: 'Transaction Date',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
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
    key: 'amount',
    type: 'number',
    label: 'Amount',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'homeCurrencyAmount',
    type: 'number',
    label: 'Home Currency Amount',
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
    key: 'currencyId',
    type: 'singleSelect',
    label: 'Currency',
    reference: { label: currencyLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'currencies',
      value: recordValue,
      label: currencyLabel,
    },
  },
  {
    key: 'associatedTransactionId',
    type: 'singleSelect',
    label: 'Associated Transaction',
    reference: { label: transactionLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'transactions',
      value: recordValue,
      label: transactionLabel,
    },
  },
];

const filters = {
  initData: {
    type: null,
    currencyId: null,
    tags: [],
    transactionDate: {
      startDate: null,
      endDate: null,
    },
  },
  layout: [
    { type: 'md', currencyId: 'md', tags: 'md' },
    { transactionDate: 'md' },
  ],
};

const actions = {
  row: {
    reverse: {
      name: 'Reverse',
      icon: 'fa-solid fa-rotate-left',
      click: async function(row, index) {
        await openReverseDialog(row);
      },
    },
  },
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

const currentRowForReverse = ref();
const reverseDialog = ref(false);

async function openReverseDialog(record) {
  currentRowForReverse.value = record;
  reverseDialog.value = true;
}

async function reverseDataAndCloseDialog() {
  await dataAccess
    .update('transactions', currentRowForReverse.value.id, {}, { path: 'reverse' })
    .then((record) => {
      events.emitEvent('loadData', { dataType: 'Transactions' });
      flashMessage(`Reversed transaction successfully!`);
    })
    .catch((error) => {
      console.error(error);
      flashMessage(`Error reversing transaction!`);
    })
    .finally(() => {
      closeReverseDialog();
    });
}

function closeReverseDialog() {
  reverseDialog.value = false;
}
</script>

<template>
  <div class="page-container">
    <DataPage
      model-class="transactions"
      data-type="Transactions"
      :fullscreen="true"
      :fields-layout="fieldsLayout"
      :data-fields="dataFields"
      :filters="filters"
      :actions="actions"
      :table-style="tableStyle"
    >
      <template #[`highlight.description`]="{ row, formattedValue }">
        {{ formattedValue }}
        <span
          v-if="row.associatedTransactionId"
          class="tag inline"
        >Reversed</span>
      </template>

      <template #[`data-col.transactionDate`]="{ formattedValue }">
        Transacted on <strong>{{ formattedValue }}</strong>
      </template>

      <template #[`data-col.amount`]="{ row, formattedValue, inputValue }">
        <strong>{{ inputValue('type', row) }}</strong> amount
        <strong>{{ row.includes.currencyId[row.currencyId].code }}{{ formattedValue }}</strong>
        <span v-if="baseCurrency.id !== row.currencyId">
          (<strong>{{ baseCurrency.code }}{{ inputValue('homeCurrencyAmount', row) }}</strong>)
        </span>
      </template>
    </DataPage>

    <TConfirmDialog
      v-if="currentRowForReverse"
      v-model="reverseDialog"
      title="Reverse Transaction"
      primary-text="Are you sure you want to reverse this transaction?"
      :secondary-text="currentRowForReverse.description"
      :width="500"
      :height="350"
      class="reverse-dialog"
      @confirm="reverseDataAndCloseDialog"
      @cancel="closeReverseDialog"
    />
  </div>
</template>
