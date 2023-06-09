<script setup>
import { ref, computed, onMounted } from 'vue';

import { useBannerStore } from '@/stores/banner';
import { useDataAccess } from '@/utils/dataAccess';
import { useLogger } from '@/utils/logger';

import {
  TTable
} from 'coffeebrew-vue-components';

const { flashMessage } = useBannerStore();
const dataAccess = useDataAccess();
const logger = useLogger();

const offset = ref(0);
const limit = ref(10);

const headers = computed(() => {
  return [
    { key: 'title', type: 'text', label: 'Subject', listable: true, viewable: true, creatable: true, updatable: false },
    {
      key: 'content',
      type: 'text',
      label: 'Content',
      listable: false,
      viewable: true,
      creatable: true,
      updatable: false,
    },
  ];
});
const data = ref([]);
const totalData = ref(0);
const dataLoading = ref(true);

async function updateOffsetAndReload(updated) {
  offset.value = updated;
  await loadData();
}

async function loadData() {
  await dataAccess
    .list('alerts', { offset: offset.value, limit: limit.value })
    .then((res) => {
      data.value = res.data;
      totalData.value = res.total;
      dataLoading.value = false;
    })
    .catch((err) => {
      dataLoading.value = false;
      logger.error(`Error loading inbox`, err);
      flashMessage(`Error loading inbox!`);
    });
}

onMounted(async() => {
  await loadData();
});
</script>

<template>
  <div class="page-container">
    <h2 class="heading">
      Inbox
    </h2>

    <div
      v-if="totalData === 0"
      class="no-data-text"
    >
      You have no unread message.
    </div>

    <TTable
      v-if="totalData > 0"
      name=""
      :headers="headers"
      :data="data"
      :loading="dataLoading"
      :pagination="{ offset, limit, client: false }"
      :total-data="totalData"
      @offset-change="updateOffsetAndReload"
    />
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}
</style>
