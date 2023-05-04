<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const routes = reactive(router.getRoutes())
</script>

<template>
  <div class="nav">
    <RouterLink
      class="nav-item"
      v-for="route in routes"
      :key="route.name"
      :to="route.path"
      active-class="active"
    >
      {{ route.name }}
    </RouterLink>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  width: 15%;
  position: fixed;
  height: 100vh;
  overflow-y: scroll;
}

.nav-item {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.nav .active {
  background-color: var(--color-background-mute);
}
</style>
