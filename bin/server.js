const app 	= require('../app'),
			debug 	= require('debug')('express-test:server'),
			http 	= require('http')

const port = process.env.PORT || '3000'
app.set('port', port)

const server = http.createServer(app)

server.listen(port)

server.on('listening', () => {
  debug('Listening on ' + port)
})