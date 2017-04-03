<template>
	<div>
		<table class="table">
			<thead>
				<tr>
					<th>Id</th>
					<th>Username</th>
					<th>updatedAt</th>
					<th>createdAt</th>
					<th>Edit</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="user in users">
					<th>{{ user._id }}</th>
					<td>{{ user.local.username }}</td>
					<td>{{ user.updatedAt }}</td>
					<td>{{ user.createdAt }}</td>
					<td><a :href="'/admin/users/' + user._id + '/edit'">Edit</a></td>
				</tr>
			</tbody>
		</table>
		<a :class="{'button': true, 'is-loading': isLoading}" @click="loadMore">Load More</a>
		<a class="button" href="/admin/users/create">Create</a>
	</div>	
</template>

<script>
import * as api from './api.js'

export default {
	name: 'user-overview',

	data() {
		return {
			users: [],
			next: null,
			isLoading: false
		}
	},

	async created() {
		let response = await api.createApiCall('/api/users?limit=5&fields=_id,local.username,updatedAt,createdAt', 'get')

		this.users = response.data.items
		this.next = response.data.next || null
	},

	methods: {
		async loadMore() {
			this.isLoading = true
			
			if(this.next) {
				let response = await api.createApiCall(this.next, 'get')

				for(let user of response.data.items) {
					this.users.push(user)
				}
				
				this.next = response.data.next || null
			}

			this.isLoading = false
		}
	}
	
}

</script>