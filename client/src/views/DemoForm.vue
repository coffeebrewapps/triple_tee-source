<script setup>
import { ref } from 'vue'

import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
import TButton from 'coffeebrew_vue_components/src/components/form/TButton.vue'
import TSelect from 'coffeebrew_vue_components/src/components/form/TSelect.vue'

const country1 = ref('')
const country2 = ref('')
const country3 = ref('')

const countryOptions = ref([
  { value: 'sg', label: 'Singapore' },
  { value: 'my', label: 'Malaysia' },
  { value: 'th', label: 'Thailand' },
  { value: 'vn', label: 'Vietnam' }
])

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

  <TSelect v-model="country1" label="Country" name="country" id="country-1" :options="countryOptions"/>
  <TSelect v-model="country2" size="sm" label="Country" name="country" id="country-2" :options="countryOptions"/>
  <TSelect v-model="country3" size="lg" label="Country" name="country" id="country-3" :options="countryOptions" error-message="Min 8 characters"/>

  <div>Selected Country1: {{ country1 }}</div>
  <div>Selected Country2: {{ country2 }}</div>
  <div>Selected Country3: {{ country3 }}</div>
</template>

<style scoped>
</style>
