import Vue from 'vue'
// import App from './App.vue'

import SocketLog from './SocketLog.vue'
import UserOverview from './UserOverview.vue'

import axios from 'axios'
import * as api from './api'

import VueSocketio from 'vue-socket.io'
Vue.use(VueSocketio, '/')

new Vue({
	el: '#app',

	components: {
		SocketLog,
		UserOverview
	},

	data: {
		user: {
			local: { username: ''},
			firstname: '',
			lastname: '',
			roles: []
		}
	},

	methods: {
		async submitForm(args) {
			let result = await api.submitForm(args)

			if(result.status === 200 || result.status === 201) {
				console.log(result)

				window.location.href = window.location.origin + args.target.getAttribute('data-after')
			}
			
		}
	},

	async mounted() {
		if(this.$el.hasAttribute('data-userId')) {
			let result = await api.createApiCall('/api/users/' + this.$el.getAttribute('data-userId') + '?fields=local.username,firstname,lastname,roles', 'get')

			this.user = result.data
			console.log(this.user)
		}
		
	}
})