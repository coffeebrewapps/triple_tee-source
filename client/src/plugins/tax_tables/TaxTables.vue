<script setup>
import DataPage from '@/components/DataPage.vue';
import { useValidations } from '@/utils/validations';
import { useRouter } from 'vue-router';

import { useTaxTableUtils } from './utils';

const router = useRouter();

const {
  fieldsLayout,
  dataFields,
} = useTaxTableUtils();

const {
  notEarlierThan,
} = useValidations();

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
  />
</template>
