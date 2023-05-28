import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDataStore } from '@/stores/data'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const dataStore = useDataStore()

import { initPlugins } from '@/utils/plugins'
initPlugins(router, dataStore)

app.mount('#app')
