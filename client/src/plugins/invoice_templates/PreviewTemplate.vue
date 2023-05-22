<script setup>
import { ref, computed, onMounted } from 'vue'

import useConfig from '@/config'
const config = useConfig()

import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()

const templatesUrl = `${config.baseUrl}/api/invoice_templates`

const latestTemplate = ref()

async function loadLatest() {
  const params = {
    limit: 1,
    sort: {
      field: 'createdAt',
      order: 'desc'
    }
  }

  await dataAccess
    .list(templatesUrl, params)
    .then((result) => {
      latestTemplate.value = result.data[0]
    })
    .catch((error) => {
      console.log(error)
    })
}

events.registerListener(
  'loadLatestTemplate',
  {
    id: 'PreviewTemplate',
    invoke: (payload) => {
      loadLatest()
    }
  }
)

onMounted(async () => {
  await loadLatest()
})
</script>

<template>
  <div class="preview-template">
    <div
      v-if="latestTemplate"
      v-html="latestTemplate.contentMarkup"
    >
    </div>
    <component
      v-if="latestTemplate"
      is="style"
      scoped
    >
      {{ latestTemplate.contentStyles }}
    </component>
  </div>
</template>
