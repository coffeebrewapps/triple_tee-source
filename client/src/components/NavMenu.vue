<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const routes = reactive(router.getRoutes())
</script>

<template>
  <div class="nav">
    <RouterLink
      v-for="route in routes"
      :key="route.name"
      :to="route.path"
    >
      {{ route.name }}
    </RouterLink>
  </div>
</template>

<style scoped>
</style>
