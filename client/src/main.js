import Vue from 'vue';
import i18n from './i18n';
import router from './router';
import VueMeta from 'vue-meta';
import VueSplide from '@splidejs/vue-splide';
import {BootstrapVue, BModal, BFormDatepicker} from 'bootstrap-vue';
import store from '@/store';
import VueSocketIOExt from 'vue-socket.io-extended';
import {io} from 'socket.io-client';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.use(VueMeta);
Vue.use(BootstrapVue);
Vue.use(VueSplide);

Vue.component('b-modal', BModal);
Vue.component('b-form-datepicker', BFormDatepicker);

const socket = io(process.env.VUE_APP_API_URL);
Vue.use(VueSocketIOExt, socket, {store});

new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
