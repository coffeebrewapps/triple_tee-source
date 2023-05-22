<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useDataAccess } from '@/utils/dataAccess'
const dataAccess = useDataAccess()
/*** import:utils ***/

/*** import:stores ***/
import { useBannerStore } from '@/stores/banner'
const banner = useBannerStore()

import { useEventsStore } from '@/stores/events'
const events = useEventsStore()
/*** import:stores ***/

/*** import:components ***/
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:global ***/
const templatesUrl = `${config.baseUrl}/api/invoice_templates`
const currentTemplate = ref()
/*** section:global ***/

/*** section:action ***/
async function updateMarkup(updated) {
  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentMarkup: updated
    }
  )

  await dataAccess
    .update(`${templatesUrl}/${currentTemplate.value.id}`, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Updated markup successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating markup!`)
    })
}

async function updateStyles(updated) {
  const params = Object.assign(
    {},
    currentTemplate.value,
    {
      contentStyles: updated
    }
  )

  await dataAccess
    .update(`${templatesUrl}/${currentTemplate.value.id}`, params)
    .then((result) => {
      currentTemplate.value = result
      showBanner(`Updated styles successfully!`)
    })
    .catch((error) => {
      showBanner(`Error updating styles !`)
    })
}
/*** section:action ***/

/*** section:banner ***/
function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}
/*** section:banner ***/

/*** section:events ***/
events.registerListener(
  'loadLatestTemplate',
  {
    id: 'PreviewTemplate',
    invoke: (payload) => {
      loadLatest()
    }
  }
)
/*** section:events ***/

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
      currentTemplate.value = result.data[0]
    })
    .catch((error) => {
      console.log(error)
    })
}

onMounted(async () => {
  await loadLatest()
})
</script>

<template>
  <TemplateEditor
    v-if="currentTemplate"
    :content-markup="currentTemplate.contentMarkup"
    :content-styles="currentTemplate.contentStyles"
    @content-markup-change="updateMarkup"
    @content-styles-change="updateStyles"
  />
</template>
