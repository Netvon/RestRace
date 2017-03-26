const debug = require('debug')('express-test:server'),
			http 	= require('http'),
			app 	= require('../app')

const port = process.env.PORT || '3000'
app.set('port', port)

const server = http.createServer(app)
require('../data/realtime')(app, server)

server.listen(port)

server.on('listening', () => {
  debug('Listening on ' + port)
})

module.exports = app