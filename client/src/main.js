import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useDataStore } from '@/stores/data';

import App from './App.vue';
import router from './router';

import './assets/main.css';

import { useUploader } from '@/utils/uploader';
import { useLogger } from '@/utils/logger';
import { initPlugins } from '@/utils/plugins';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const dataStore = useDataStore();
const uploader = useUploader();
const logger = useLogger();
initPlugins(router, dataStore, uploader, logger);

app.use(router);

app.mount('#app');
