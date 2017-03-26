<template>
	<div id="app">
		<div class="log-list">
			<div class="notification is-primary log-item" v-for="message in messages">
				{{ message }}
			</div>
		</div>
	</div>
</template>

<script>

import axios from 'axios'

export default {
	name: 'app',
	data() {
		return {
			messages: []
		}
	},

	sockets: {
		"race-added": function(val) {
			this.messages.push({ key: "race-added", val })
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
	}
}
</script>

<style lang="scss">

.log-list {
    margin: 0;
    padding: 0;
}

.log-item {
    font-family: monospace;
}

.main-section {
	flex-grow: 1;
}

#app {
    font-family: -apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}

body {
	margin: 0;
    min-height: 100vh;
	display: flex;
	flex-direction: column;
}
</style>