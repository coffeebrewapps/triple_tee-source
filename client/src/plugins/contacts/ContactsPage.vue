<script setup>
import { useRouter } from 'vue-router';

import DataPage from '@/components/DataPage.vue';

import { useContactUtils } from './utils';
import { useSystemConfigsStore } from '@/stores/systemConfigs';

const router = useRouter();
const systemConfigsStore = useSystemConfigsStore();

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
  router.push({ name: 'View Contact', params: { contactId: id } });
}

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'name',
};

function sameAsBaseContact(row) {
  const systemConfigs = systemConfigsStore.getSystemConfigs();
  return systemConfigs.baseContactId === row.id;
}

function formatContactField(row, inputValue) {
  if (!row.contactNumber1 && !row.contactPerson1 && !row.contactEmail1) { return ``; }

  const parts = [];
  const contactChannels = [];

  parts.push(`Contact`);

  if (row.contactPerson1) {
    parts.push(`${inputValue('contactPerson1', row)}`);
  }

  if (row.contactNumber1) {
    contactChannels.push(inputValue('contactNumber1', row));
  }

  if (row.contactEmail1) {
    contactChannels.push(inputValue('contactEmail1', row));
  }

  parts.push(`at ${contactChannels.join(' / ')}`);

  return parts.join(' ');
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
    :table-style="tableStyle"
  >
    <template #[`highlight.name`]="{ row, formattedValue }">
      <div class="align-middle">
        <strong>{{ formattedValue }}</strong>
        <span
          v-if="sameAsBaseContact(row)"
          class="tag inline"
        >Base</span>
      </div>
    </template>

    <template #[`data-col.contactNumber1`]="{ row, inputValue }">
      {{ formatContactField(row, inputValue) }}
    </template>
  </DataPage>
</template>
