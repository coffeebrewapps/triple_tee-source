<script setup>
import { onMounted, computed, ref } from 'vue'

import useConfig from '@/config'
import DataPage from '@/components/DataPage.vue'

const config = useConfig()

const divisionsUrl = computed(() => {
  return `${config.baseUrl}/api/divisions`
})

const fieldsLayout = ref([
  { name: 'lg', joinDate: 'md' },
  { division: 'lg' },
  { email: 'lg', phone: 'md' }
])

function recordValue(record) {
  return record.id
}

function divisionLabel(record) {
  return record.name
}

function formatDivision(record) {
  if (record) {
    return record[0]
  } else {
    return ``
  }
}

const dataFields = computed(() => {
  return [
    { key: 'id', type: 'text', label: 'ID', listable: true, viewable: true, creatable: false, updatable: false },
    { key: 'name', type: 'text', label: 'Name', listable: true, viewable: true, creatable: true, updatable: true },
    { key: 'email', type: 'text', label: 'Email', listable: true, viewable: true, creatable: true, updatable: true },
    {
      key: 'division', type: 'select', label: 'Division',
      reference: { label: divisionLabel },
      listable: false, viewable: true, creatable: true, updatable: true,
      options: {
        server: true,
        sourceUrl: divisionsUrl.value,
        value: recordValue,
        label: divisionLabel
      }
    },
    { key: 'joinDate', type: 'date', label: 'Join Date', listable: false, viewable: true, creatable: true, updatable: true },
    { key: 'phone', type: 'text', label: 'Phone', listable: false, viewable: true, creatable: true, updatable: true }
  ]
})

onMounted(async () => {
})
</script>

<template>
  <DataPage
    data-type="User"
    url-base="api/users"
    schemas-url-base="api/schemas/users"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :form-dialog-full-screen="false"
  >
    <template #view-col.division="{ field, value, formattedValue }">
      <div class="data-label">Division</div>
      <div class="data-value">
        {{ formatDivision(formattedValue) }}
      </div>
    </template>
  </DataPage>
</template>
