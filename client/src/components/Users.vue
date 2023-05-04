<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const el = ref()
const users = reactive({})

const env = import.meta.env
const url = ref('url')

if (env.MODE === 'development') {
  url.value = `http://localhost:${env.VITE_SERVER_PORT}/api/users`
} else {
  url.value = `/api/users`
}

onMounted(async () => {
  await axios
    .get(url.value)
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
