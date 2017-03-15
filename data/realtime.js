module.exports = function(app, server) {
	let io = require('socket.io')()
	io.attach(server)

	let realtime = new Realtime(io)

	app.set('realtime', realtime)
}

class Realtime {

	/**
	 * Creates an instance of Realtime.
	 * @param {SocketIO.Server} io 
	 * 
	 * @memberOf Realtime
	 */
	constructor(io) {
		this.__io = io
	}

	/**
	 * Sends an event under the 'msg' name
	 * 
	 * @param {any} message 
	 * 
	 * @memberOf Realtime
	 */
	sendMsg(message) {
		this.__io.emit('msg', message)
	}
	/**
	 * Sends an event under
	 * 
	 * @param {string} eventName 
	 * @param {any} eventData 
	 * 
	 * @memberOf Realtime
	 */
	send(eventName, eventData) {
		this.__io.emit('msg', eventData)
	}
}