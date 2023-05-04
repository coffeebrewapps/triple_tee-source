import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import {
  TConfirmDialog,
  TDialog,
  TButton,
  TCheckbox,
  TDatePicker,
  TInput,
  TOption,
  TSelect,
  TTable,
  TProgressBar
} from 'coffeebrew-vue-components'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
