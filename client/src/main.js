import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useDataStore } from '@/stores/data';

import App from './App.vue';
import router from './router';

import './assets/main.css';

import { initPlugins } from '@/utils/plugins';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const dataStore = useDataStore();
initPlugins(router, dataStore);

app.mount('#app');
