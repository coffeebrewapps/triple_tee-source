<script setup>
import { ref } from 'vue'
import DataPage from '../components/DataPage.vue'

const headers = ref([
  { key: 'id', type: 'text', label: 'ID' },
  { key: 'name', type: 'text', label: 'Name' },
  { key: 'email', type: 'text', label: 'Email' }
])

const updatableSchema = ref([
  { key: 'name', type: 'text', label: 'Name' },
  { key: 'email', type: 'text', label: 'Email' },
  { key: 'division', type: 'text', label: 'Division' }
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
    :updatable-schema="updatableSchema"
    url-base="api/users"
    :headers="headers"
    :view-dialog-title="viewDialogTitle"
    :update-dialog-title="updateDialogTitle"
    :delete-dialog-title="deleteDialogTitle"
  />
</template>
