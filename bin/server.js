const debug = require('debug')('express-test:server'),
			http 	= require('http'),
			io = require('socket.io')(),
			app 	= require('../app')

const port = process.env.PORT || '3000'
app.set('port', port)

const server = http.createServer(app)
io.attach(server)
require('../data/realtime')(app, server)

server.listen(port)

server.on('listening', () => {
  debug('Listening on ' + port)
})