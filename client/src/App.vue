<script setup>
import { RouterView } from 'vue-router'
import NavMenu from './components/NavMenu.vue'
</script>

<template>
  <NavMenu />

  <div class="content-container">
    <RouterView />
  </div>
</template>
