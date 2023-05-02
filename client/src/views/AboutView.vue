<script setup>
import Users from '../components/Users.vue'
</script>

<template>
  <h1>This is an about page</h1>
  <Users />
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
