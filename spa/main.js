import Vue from 'vue'
import App from './App.vue'

import VueSocketio from 'vue-socket.io'
Vue.use(VueSocketio, '/')

new Vue({
	el: '#app',
	render: h => h(App)
})