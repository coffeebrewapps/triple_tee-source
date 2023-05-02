<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const el = ref()
const users = reactive({})

onMounted(async () => {
  await axios
    .get('/api/users')
    .then((res) => {
      users.value = res.data.data
    })
    .catch((err) => {
      el.value = JSON.stringify(err)
    })
})
</script>

<template>
  <div ref="el">
    <ul>
      <li
        v-for="user in users.value"
        :key="user.id"
      >
        {{ user.name }} | {{ user.email }}
      </li>
    </ul>
  </div>
</template>
