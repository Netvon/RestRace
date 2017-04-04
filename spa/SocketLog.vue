<template>
	<div class="socket-log">
		<div class="log-list">
			<div v-for="message in messages">
				<div class="message is-info">
					<div class="message-header">
						<p>{{ message.type }} <span class="tag" v-if="message.val.error">{{ message.val.error.status}}</span></p>
					</div>
					<div class="message-body">
						<p v-if="message.val.error">{{ message.val.error.message }}</p>
						<figure class="highlight" v-if="message.val.error">
							<pre><code>{{ message.val.error.stack }}</code></pre>
						</figure>
						<figure class="highlight" v-if="message.type === 'request-log'">
							<pre><code>{{ message.val }}</code></pre>
						</figure>
					</div>
				</div>				
			</div>
		</div>
	</div>
</template>

<script>

import axios from 'axios'

export default {
	name: 'socket-log',

	data() {
		return {
			messages: []
		}
	},

	sockets: {
		"race-added": function(val) {
			this.messages.push({type: 'race-added', val })
		},

		"race-resolved": function(val) {
			this.messages.push({type: 'race-resolved', val })
		},

		"request-log": function(val) {
			this.messages.push({type: 'request-log', val })
		},

		error: function(val) {
			this.messages.push({ type: 'error', val })
		},

		msg: function(val) {
			this.messages.push({ type: 'message', val })
		}
	}
}
</script>

<style lang="scss">
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


.log-list {
    margin: 0;
    padding: 0;
}

.log-item {
    font-family: monospace;
}
</style>