<script setup>
import { ref } from 'vue'

import {
  TInput,
  TButton
} from 'coffeebrew-vue-components'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

function authenticate() {
  errorMessage.value = ''
  if (password.value.length < 8) {
    errorMessage.value = 'Min length of 8'
  } else {
    alert(`Login successfully! Hello ${username.value}`)
  }
}
</script>

<template>
  <div class="login">
    <div class="input">
      <TInput type="text" label="Username" v-model="username"/>
      <TInput type="password" label="Password" v-model="password" :error-message="errorMessage"/>
    </div>

    <div class="actions">
      <TButton button-type="text" value="Login" icon="fa-solid fa-right-to-bracket" @click="authenticate()"/>

      <div class="hyperlink">
        <a href="#">New User</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-content: space-between;
  align-items: center;
  place-items: center;
  justify-content: center;
  row-gap: 2rem;
  margin: 0 auto;
  height: 100vh;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>
