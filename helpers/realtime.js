function create(app, server) {
	io = require('socket.io')(server)

	io.on('connection', socket => {
		socket.send('Welcome')
	})

	app.set('realtime', realtime)

	Object.freeze(realtime)
}

class Realtime {

	/**
	 * Sends an event under the 'msg' name
	 * 
	 * @param {any} message 
	 * 
	 * @memberOf Realtime
	 */
	sendMsg(message) {
		io.emit('msg', message)
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
		io.emit(eventName, eventData)
	}

	sendToRoom(room, eventName, eventData) {
		io.to(room).emit(eventName, eventData)
	}
	

	get io() {
		return io
	}
}

/*
* Well, this would have been nice to know a little earlier 🤓 https://nodejs.org/api/modules.html#modules_caching
*/

let io =  {}
let realtime = new Realtime()
module.exports = {
	realtime,
	create
}