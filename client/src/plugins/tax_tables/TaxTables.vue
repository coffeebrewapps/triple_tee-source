<script setup>
import DataPage from '@/components/DataPage.vue';
import { useValidations } from '@/utils/validations';
import { useFormatter } from '@/utils/formatter';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import { useRouter } from 'vue-router';

import { useTaxTableUtils } from './utils';

const router = useRouter();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

const {
  fieldsLayout,
  dataFields,
} = useTaxTableUtils();

const {
  notEarlierThan,
} = useValidations();

const {
  formatTagSync,
  tagStyle,
} = useFormatter();

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart');
}

const validations = {
  create: {
    effectiveEnd: [
      validateEffectiveEnd,
    ],
  },
  update: {
    effectiveEnd: [
      validateEffectiveEnd,
    ],
  },
};

const filters = {
  initData: {
    description: null,
    includeTags: [],
    excludeTags: [],
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
    { description: 'lg' },
    { includeTags: 'md', excludeTags: 'md' },
    { effectiveStart: 'md' },
    { effectiveEnd: 'md' },
  ],
};

const actions = {
  view: {
    click: async function(row, index) {
      await openViewPage(row);
    },
  },
};

async function openViewPage(row) {
  router.push({ name: 'View Tax Table', params: { id: row.id } });
}

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};
</script>

<template>
  <DataPage
    model-class="tax_tables"
    data-type="Tax Tables"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :actions="actions"
    :table-style="tableStyle"
  >
    <template #[`highlight.description`]="{ formattedValue }">
      {{ formattedValue }}
    </template>

    <template #[`data-col.effectiveStart`]="{ row, formattedValue, inputValue }">
      Effective <strong>{{ formattedValue }}</strong>
      <span v-if="row.effectiveEnd"> - <strong>{{ inputValue('effectiveEnd', row) }}</strong></span>
      <span v-if="!row.effectiveEnd"> - <strong>present</strong></span>
    </template>

    <template #[`data-col.includeTags`]="{ row, key, rawValue }">
      <span
        v-for="(tag, t) in rawValue"
        :key="t"
        class="tag inline"
        :style="tagStyle(row, tag, key)"
      >
        {{ formatTagSync(row, tag, key, systemConfigs.tagFormat) }}
      </span>
    </template>
  </DataPage>
</template>
