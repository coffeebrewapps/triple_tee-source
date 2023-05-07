<script setup>
import { ref } from 'vue'
import DataPage from '../components/DataPage.vue'

const headers = ref([
  { key: 'id', type: 'number', label: 'ID' },
  { key: 'name', type: 'text', label: 'Name' },
  { key: 'email', type: 'text', label: 'Email' }
])

const updatableFields = ref([
  'name',
  'email',
  'division',
  'joinDate',
  'phone'
])

function viewDialogTitle(row) {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}

function updateDialogTitle(row)  {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}

function deleteDialogTitle(row) {
  if (row) {
    return `User ${row.id}`
  } else {
    return ``
  }
}
</script>

<template>
  <DataPage
    data-type="User"
    url-base="api/users"
    schemas-url-base="api/schemas/users"
    :headers="headers"
    :updatable-fields="updatableFields"
    :view-dialog-title="viewDialogTitle"
    :update-dialog-title="updateDialogTitle"
    :delete-dialog-title="deleteDialogTitle"
  />
</template>
