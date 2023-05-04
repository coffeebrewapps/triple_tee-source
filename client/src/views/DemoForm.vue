<script setup>
import { ref } from 'vue'

import TInput from 'coffeebrew_vue_components/src/components/form/TInput.vue'
import TButton from 'coffeebrew_vue_components/src/components/form/TButton.vue'
import TSelect from 'coffeebrew_vue_components/src/components/form/TSelect.vue'
import TCheckbox from 'coffeebrew_vue_components/src/components/form/TCheckbox.vue'

const model = {
  username: ref(''),
  name: ref(''),
  description: ref(''),
  password: ref(''),
  country1: ref(''),
  country2: ref(''),
  country3: ref(''),
  subscribe: ref(false),
  agree: ref(false)
}

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
      <TInput v-model="model.username.value" type="text" label="Username"/>
      <TInput v-model="model.name.value" type="text" size="md" label="Name"/>
      <TInput v-model="model.description.value" type="text" size="lg" label="Description"/>
      <TInput v-model="model.password.value" type="password" label="Password" error-message="Min 8 characters"/>

      <TButton button-type="text" value="Very Long Button" icon="fa-sharp fa-solid fa-circle-down" @click="hello('Hello World!')"/>
      <TButton button-type="text" size="lg" value="Very Long Long Button with Icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TButton button-type="icon" icon="fa-sharp fa-solid fa-circle-down"/>

      <TSelect v-model="model.country1.value" label="Country" name="country" id="country-1" :options="countryOptions"/>
      <TSelect v-model="model.country2.value" size="sm" label="Country" name="country" id="country-2" :options="countryOptions"/>
      <TSelect v-model="model.country3.value" size="lg" label="Country" name="country" id="country-3" :options="countryOptions" error-message="Min 8 characters"/>

      <TCheckbox v-model="model.subscribe.value" label="Subscribe newsletter"/>
      <TCheckbox v-model="model.agree.value" label="Agree T&C" error-message="Required!"/>
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
