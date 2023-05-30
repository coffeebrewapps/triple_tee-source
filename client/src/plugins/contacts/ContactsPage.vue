<script setup>
import { useRouter } from 'vue-router';

import DataPage from '@/components/DataPage.vue';

import { useContactUtils } from './utils';
const router = useRouter();
const {
  fieldsLayout,
  dataFields,
  filters,
  validations,
} = useContactUtils();

const actions = {
  view: {
    click: async function(row, index) {
      await openViewPage(row.id);
    },
  },
};

async function openViewPage(id) {
  router.push({ name: 'View Contact', params: { id } });
}
</script>

<template>
  <DataPage
    model-class="contacts"
    data-type="Contacts"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :actions="actions"
  />
</template>
