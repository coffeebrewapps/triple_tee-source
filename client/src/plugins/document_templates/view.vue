<script setup>
/*** import:global ***/
import { ref, computed } from 'vue'
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
import DataPage from '@/components/DataPage.vue'
import TabContainer from '@/components/TabContainer.vue'
import PreviewTemplate from './PreviewTemplate.vue'
import TemplateEditor from '@/components/TemplateEditor.vue'

import {
  TButton,
  TDialog
} from 'coffeebrew-vue-components'
/*** import:components ***/

/*** section:banner ***/
function showBanner(message) {
  banner.show(message)
  setTimeout(hideBanner, 5000)
}

function hideBanner() {
  banner.hide()
}
/*** section:banner ***/

/*** section:global ***/
const templateType = ref()
const invoiceTemplatesUrl = `${config.baseUrl}/api/invoice_templates`
const receiptTemplatesUrl = `${config.baseUrl}/api/receipt_templates`
const templatesUrl = computed(() => {
  if (templateType.value) {
    return `${config.baseUrl}/api/${templateType.value}`
  } else {
    return ``
  }
})

const fieldsLayout = [
  { name: 'lg' },
  { contentMarkup: 'lg' },
  { contentStyles: 'lg' }
]

const dataFields = [
  { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false, sortable: true },
  { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: true, filterable: true, sortable: true },
  { key: 'contentMarkup', type: 'textarea', label: 'Content Markup', listable: false, viewable: true, creatable: true, updatable: true },
  { key: 'contentStyles', type: 'textarea', label: 'Content Styles', listable: false, viewable: true, creatable: true, updatable: true }
]

const validations = {
}

const filters = {
  initData: {},
  layout: [
    { name: 'lg' }
  ]
}
/*** section:global ***/

/*** section:tab ***/
const tabs = [
  { label: 'Invoice', onchange: updateInvoiceTemplates },
  { label: 'Receipt', onchange: updateReceiptTemplates }
]

function updateLatestTemplate() {
  events.emitEvent('loadLatestTemplate', {})
}

function updateInvoiceTemplates() {
  templateType.value = 'invoice_templates'
  events.emitEvent('loadData', { dataType: 'Invoice Templates' })
}

function updateReceiptTemplates() {
  templateType.value = 'receipt_templates'
  events.emitEvent('loadData', { dataType: 'Receipt Templates' })
}

function triggerTabEvent(i) {
  tabs[i].onchange()
}
/*** section:tab ***/

/*** section:dataPage ***/
const currentRow = ref()
const viewDialog = ref(false)
const updateDialog = ref(false)

const invoiceRowActions = {
  view: {
    click: async function(row, index) {
      templateType.value = 'invoice_templates'
      await openViewDialog(row.id)
    }
  },
  update: {
    click: async function(row, index) {
      templateType.value = 'invoice_templates'
      await openUpdateDialog(row.id)
    }
  }
}

const receiptRowActions = {
  view: {
    click: async function(row, index) {
      templateType.value = 'receipt_templates'
      await openViewDialog(row.id)
    }
  },
  update: {
    click: async function(row, index) {
      templateType.value = 'receipt_templates'
      await openUpdateDialog(row.id)
    }
  }
}

async function openViewDialog(id) {
  await dataAccess
    .view(`${templatesUrl.value}/${id}`, {})
    .then((result) => {
      currentRow.value = result
      viewDialog.value = true
    })
    .catch((error) => {
      console.log(error)
    })
}

function closeViewDialog() {
  viewDialog.value = false
}

async function openUpdateDialog(id) {
  await dataAccess
    .view(`${templatesUrl.value}/${id}`, {})
    .then((result) => {
      currentRow.value = result
      updateDialog.value = true
    })
    .catch((error) => {
      console.log(error)
    })
}

function closeUpdateDialog() {
  updateDialog.value = false
}

async function updateMarkup(updated) {
  const params = Object.assign({}, currentRow.value, { contentMarkup: updated })
  await updateTemplate(currentRow.value.id, params)
}

async function updateStyles(updated) {
  const params = Object.assign({}, currentRow.value, { contentStyles: updated })
  await updateTemplate(currentRow.value.id, params)
}

async function updateTemplate(id, params) {
  await dataAccess
    .update(`${templatesUrl.value}/${id}`, params)
    .then((record) => {
      currentRow.value = record
      showBanner(`Data updated successfully!`)
    })
    .catch((error) => {
      console.log(error)
      showBanner(`Error updating data!`)
    })
}
/*** section:dataPage ***/
</script>

<template>
  <div class="view-container">
    <h2 class="heading">Document Templates</h2>

    <TabContainer
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <DataPage
          data-type="Invoice Templates"
          url-base="api/invoice_templates"
          schemas-url-base="api/schemas/invoice_templates"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
          :row-actions="invoiceRowActions"
        />
      </template>

      <template #tab-1>
        <DataPage
          data-type="Receipt Templates"
          url-base="api/receipt_templates"
          schemas-url-base="api/schemas/receipt_templates"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
          :row-actions="receiptRowActions"
        />
      </template>
    </TabContainer>

    <TDialog
      v-model="viewDialog"
      title="View Template"
      :fullscreen="true"
    >
      <template #body>
        <div class="template-editor">
          <TemplateEditor
            v-if="currentRow"
            :templates-url="templatesUrl"
            :id="currentRow.id"
            :content-markup="currentRow.contentMarkup"
            :content-styles="currentRow.contentStyles"
            :disabled="true"
          />
        </div>
      </template>

      <template #actions>
        <TButton button-type="text" value="Close" icon="fa-solid fa-xmark" @click="closeViewDialog()"/>
      </template>
    </TDialog>

    <TDialog
      v-model="updateDialog"
      title="Update Template"
      :fullscreen="true"
    >
      <template #body>
        <div class="template-editor">
          <TemplateEditor
            v-if="currentRow"
            :templates-url="templatesUrl"
            :id="currentRow.id"
            :content-markup="currentRow.contentMarkup"
            :content-styles="currentRow.contentStyles"
            @content-markup-change="updateMarkup"
            @content-styles-change="updateStyles"
          />
        </div>
      </template>

      <template #actions>
        <TButton button-type="text" value="Close" icon="fa-solid fa-xmark" @click="closeUpdateDialog()"/>
      </template>
    </TDialog>

  </div>
</template>

<style scoped>
.view-container {
  margin: 1rem 0;
}

.heading {
  font-weight: 900;
}

.template-editor {
  text-align: left !important;
}
</style>
