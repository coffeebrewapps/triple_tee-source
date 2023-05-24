<script setup>
/*** import:global ***/
import { ref, computed, onMounted } from 'vue'
/*** import:global ***/

/*** import:config ***/
import useConfig from '@/config'
const config = useConfig()
/*** import:config ***/

/*** import:utils ***/
import { useWorkLogUtils } from './utils'
const {
  tagsUrl,
  worklogsUrl,
  dataFields,
  recordValue,
  tagLabel
} = useWorkLogUtils()

const templatesUrl = `${config.baseUrl}/api/invoice_templates`

function templateLabel(record) {
  return record.name
}

const filtersDataFields = computed(() => {
  const fields = []

  fields.push(Object.assign({}, dataFields.find(f => f.key === 'tags')))
  fields.push(Object.assign({}, dataFields.find(f => f.key === 'startTime'), { type: 'datetimerange' }))
  fields.push(Object.assign({}, dataFields.find(f => f.key === 'endTime'), { type: 'datetimerange' }))

  fields.push({
    key: 'invoiceTemplateId', type: 'singleSelect', label: 'Template',
    updatable: true,
    reference: { label: templateLabel },
    options: {
      server: true,
      pagination: true,
      sourceUrl: templatesUrl,
      value: recordValue,
      label: templateLabel
    }
  })

  return fields
})

import { useInputHelper } from '@/utils/input'

const {
  multiSelectableField,
  singleSelectableField
} = useInputHelper(filtersDataFields.value)

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
import Form from '@/components/Form.vue'
import TemplateEditor from '@/components/TemplateEditor.vue'
/*** import:components ***/

/*** section:props ***/
const props = defineProps({
})
/*** section:props ***/

/*** section:global ***/
const filtersData = ref({
  tags: [],
  invoiceTemplateId: [],
  startTime: {
    startTime: null,
    endTime: null
  },
  endTime: {
    startTime: null,
    endTime: null
  }
})

const filtersLayout = computed(() => {
  return [
    { invoiceTemplateId: 'lg', tags: 'lg' },
    { startTime: 'md' },
    { endTime: 'md' }
  ]
})

const filterableKeys = computed(() => {
  return filtersDataFields.value.map(f => f.key)
})

const filtersErrorMessages = ref({})

const filtersConfirmButton = computed(() => {
  return {
    type: 'text',
    value: 'Generate',
    icon: 'fa-solid fa-check'
  }
})

const filtersCancelButton = computed(() => {
  return {
    type: 'text',
    value: 'Cancel',
    icon: 'fa-solid fa-xmark'
  }
})
/*** section:global ***/

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
/*** section:events ***/

/*** section:styles ***/
/*** section:styles ***/

/*** section:actions ***/
function formatFilters(filters = {}) {
  return Object.entries(filters).reduce((o, [field, value]) => {
    if (value) {
      if (singleSelectableField(field)) {
        o[field] = value[0].value
      } else if (multiSelectableField(field)) {
        o[field] = value.map(v => v.value)
      } else {
        o[field] = value
      }
    }
    return o
  }, {})
}

async function submitFilters() {
  const formattedFilters = formatFilters(filtersData.value)
  const params = {
    filters: formattedFilters,
    sort: {
      field: 'createdAt',
      order: 'asc'
    }
  }

  const invoiceTemplateId = formattedFilters.invoiceTemplateId

  Promise
    .all([loadFilteredWorkLogs(params), loadTemplate(invoiceTemplateId)])
    .then((results) => {
      filteredWorklogs.value = {
        invoiceLines: results[0]
      }
      currentTemplate.value = results[1]
    })
    .catch((error) => {
      console.log(error)
      showBanner(`Error loading data!`)
    })
}

const filteredWorklogs = ref({})
async function loadFilteredWorkLogs(params) {
  return new Promise((resolve, reject) => {
    dataAccess
      .list(worklogsUrl, params)
      .then((result) => {
        resolve(result.data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

const currentTemplate = ref()
async function loadTemplate(id) {
  return new Promise((resolve, reject) => {
    dataAccess
      .view(`${templatesUrl}/${id}`)
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function resetFilters() {
  filtersData.value = {
    tags: [],
    invoiceTemplateId: [],
    startTime: {
      startTime: null,
      endTime: null
    },
    endTime: {
      startTime: null,
      endTime: null
    }
  }
}
/*** section:actions ***/

onMounted(() => {
  resetFilters()
})
</script>

<template>
  <div class="view-template">
    <Form
      v-model="filtersData"
      :fields-layout="filtersLayout"
      :data-fields="filterableKeys"
      :schemas="filtersDataFields"
      :error-messages="filtersErrorMessages"
      :confirm-button="filtersConfirmButton"
      :cancel-button="filtersCancelButton"
      @submit="submitFilters"
      @cancel="resetFilters"
    />

    <TemplateEditor
      v-if="currentTemplate"
      :templates-url="templatesUrl"
      :id="currentTemplate.id"
      :content-markup="currentTemplate.contentMarkup"
      :content-styles="currentTemplate.contentStyles"
      :data="filteredWorklogs"
      :disabled="true"
    />
  </div>
</template>

<style scoped>
</style>
