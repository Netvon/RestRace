<template>
	<div id="app">
		<ul class="race-list">
			<li class="race-item box" v-for="race in races">
				<h4 class="title is-4">{{ race.name }} <span class="tag is-dark">{{ race.status }}</span></h4>
				<p>{{ race.description || 'No description' }}</p>				
			</li>
		</ul>

		<ul class="log-list">
			<li class="log-item" v-for="message in messages">
				{{ message }}
			</li>
		</ul>
	</div>
</template>

<script>

import axios from 'axios'

export default {
	name: 'app',
	data() {
		return {
			messages: [],
			races: []
		}
	},

	sockets: {
		"race-added": function(val) {
			this.messages.push(val)
		},

		"race-resolved": function(val) {
			this.messages.push(val)
		},

		error: function(val) {
			this.messages.push(val)
		},

		msg: function(val) {
			this.messages.push(val)
		}
	},

	async mounted() {
		let races = await axios.get('http://localhost:3000/api/races')
		this.races = races.data
	}
}
</script>

<style lang="scss">

.log-list {
	list-style: none;
    margin: 0;
    padding: 0;
}

.log-item {
	background: #373737;
    color: #d5d5d5;
    padding: .5em;
    font-family: monospace;
    border-bottom: 1px solid #4d4d4d;
}

.race-list {
    list-style: none;
    padding: 0;
    margin: 0;
	background: white;
    display: flex;
    flex-wrap: wrap;
}

.race-item {
    padding: .5em;
    background: #f6f6f6;
}

#app {
    font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}

pre {
	margin: 0;
}

body {
	margin: 0;
    min-height: 100vh;
    background: #474747;
}
</style>