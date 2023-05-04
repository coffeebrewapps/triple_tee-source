<script setup>
import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
</script>

<template>
  <h1>Demo Form Elements</h1>
  <TInput type="text" label="Username"/>
  <TInput type="text" size="md" label="Name"/>
  <TInput type="text" size="lg" label="Description"/>
  <TInput type="password" label="Password" error-message="Min 8 characters"/>
</template>

<style scoped>
</style>
