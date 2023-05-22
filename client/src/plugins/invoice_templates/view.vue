<script setup>
import { useEventsStore } from '@/stores/events'
const events = useEventsStore()

import DataPage from '@/components/DataPage.vue'
import TabContainer from '@/components/TabContainer.vue'
import PreviewTemplate from './PreviewTemplate.vue'

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

const tabs = [
  { label: 'Latest', onchange: updateLatestTemplate },
  { label: 'All Templates', onchange: updateAllTemplates }
]

function updateLatestTemplate() {
  events.emitEvent('loadLatestTemplate', {})
}

function updateAllTemplates() {
  events.emitEvent('loadData', { dataType: 'Invoice Templates' })
}

function triggerTabEvent(i) {
  tabs[i].onchange()
}
</script>

<template>
  <div class="view-container">
    <h2 class="heading">Invoice Templates</h2>

    <TabContainer
      :tabs="tabs"
      @tab-change="triggerTabEvent"
    >
      <template #tab-0>
        <PreviewTemplate />
      </template>

      <template #tab-1>
        <DataPage
          data-type="Invoice Templates"
          url-base="api/invoice_templates"
          schemas-url-base="api/schemas/invoice_templates"
          :fullscreen="true"
          :fields-layout="fieldsLayout"
          :data-fields="dataFields"
          :validations="validations"
          :filters="filters"
        />
      </template>
    </TabContainer>
  </div>
</template>
