<script setup>
import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
import TButton from 'coffeebrew_vue_components/src/components/form/TButton.vue'

function hello(text) {
  alert(text)
}
</script>

<template>
  <h1>Demo Form Elements</h1>
  <TInput type="text" label="Username"/>
  <TInput type="text" size="md" label="Name"/>
  <TInput type="text" size="lg" label="Description"/>
  <TInput type="password" label="Password" error-message="Min 8 characters"/>

  <TButton button-type="text" value="Very Long Button" icon="fa-sharp fa-solid fa-circle-down" @click="hello('Hello World!')"/>
  <TButton button-type="text" size="lg" value="Very Long Long Button with Icon" icon="fa-sharp fa-solid fa-circle-down"/>

  <TButton button-type="icon" icon="fa-sharp fa-solid fa-circle-down"/>
</template>

<style scoped>
</style>
