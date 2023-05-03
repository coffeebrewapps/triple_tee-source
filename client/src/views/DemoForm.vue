<script setup>
import { ref } from 'vue'

import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
import TButton from 'coffeebrew_vue_components/src/components/form/TButton.vue'
import TSelect from 'coffeebrew_vue_components/src/components/form/TSelect.vue'
import TCheckbox from 'coffeebrew_vue_components/src/components/form/TCheckbox.vue'

const model = ref({
  username: '',
  name: '',
  description: '',
  password: '',
  country1: '',
  country2: '',
  country3: '',
  subscribe: false,
  agree: false
})

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
  <div class="form-container">
    <div class="form">
      <TInput v-model="model.username" type="text" label="Username"/>
      <TInput v-model="model.name" type="text" size="md" label="Name"/>
      <TInput v-model="model.description" type="text" size="lg" label="Description"/>
      <TInput v-model="model.password" type="password" label="Password" error-message="Min 8 characters"/>

      <TButton button-type="text" value="Very Long Button" icon="fa-sharp fa-solid fa-circle-down" @click="hello('Hello World!')"/>
      <TButton button-type="text" size="lg" value="Very Long Long Button with Icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TButton button-type="icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TSelect v-model="model.country1" label="Country" name="country" id="country-1" :options="countryOptions"/>
      <TSelect v-model="model.country2" size="sm" label="Country" name="country" id="country-2" :options="countryOptions"/>
      <TSelect v-model="model.country3" size="lg" label="Country" name="country" id="country-3" :options="countryOptions" error-message="Min 8 characters"/>

      <TCheckbox v-model="model.subscribe" label="Subscribe newsletter"/>
      <TCheckbox v-model="model.agree" label="Agree T&C" error-message="Required!"/>
    </div>

    <div class="result">
      <h2>Output</h2>
      <div
        v-for="key in Object.keys(model)"
      >
        {{ key }}: {{ model[key] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
}

.form {
  width: 60%;
}
</style>
