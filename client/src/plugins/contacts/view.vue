<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

import DataPage from '@/components/DataPage.vue'

import { useContactUtils } from './utils'
const {
  countriesUrl,
  fieldsLayout,
  dataFields,
  filters,
  validations,
  countryValue,
  countryLabel
} = useContactUtils()

const actions = {
  view: {
    click: async function(row, index) {
      await openViewPage(row.id)
    }
  }
}

async function openViewPage(id) {
  router.push({ name: 'View Contact', params: { id } })
}
</script>

<template>
  <DataPage
    data-type="Contacts"
    url-base="api/contacts"
    schemas-url-base="api/schemas/contacts"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :actions="actions"
  />
</template>
