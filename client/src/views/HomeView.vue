<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

import useConfig from '../config'
import { useBannerStore } from '../stores/banner'

import {
  TTable
} from 'coffeebrew-vue-components'

const config = useConfig()
const banner = useBannerStore()

const url = computed(() => {
  return `${config.baseUrl}/api/alerts`
})

const offset = ref(0)
const limit = ref(10)

const headers = computed(() => {
  return [
    { key: 'title', type: 'text', label: 'Subject', listable: true, viewable: true, creatable: true, updatable: false },
    { key: 'content', type: 'text', label: 'Content', listable: false, viewable: true, creatable: true, updatable: false }
  ]
})
const data = ref([])
const totalData = ref(0)
const dataLoading = ref(true)

async function updateOffsetAndReload(updated) {
  offset.value = updated
  await loadData()
}

function showBanner(message) {
  banner.show(message)
}

function hideBanner() {
  banner.hide()
}

async function loadData() {
  await axios
    .get(url.value, { params: { offset: offset.value, limit: limit.value } })
    .then((res) => {
      data.value = res.data.data
      totalData.value = res.data.total
      dataLoading.value = false
    })
    .catch((err) => {
      dataLoading.value = false
      showBanner(JSON.stringify(err, false, 4))
    })
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div class="page-container">
    <h2 class="heading">Inbox</h2>

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
      :pagination="{ limit: limit, client: false }"
      :total-data="totalData"
      @offset-change="updateOffsetAndReload"
    >
    </TTable>
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
