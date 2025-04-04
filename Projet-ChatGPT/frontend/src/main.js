import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import axios from 'axios';

const app = createApp(App);

app.use(vuetify);

app.config.globalProperties.$axios = axios;

app.mount('#app');