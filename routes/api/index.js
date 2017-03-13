module.exports = function(express, io) {
	let router = express.Router(),
		socketIo = io.of('/api/v1')


	router.use('*', (req, res, next) => {
		req.isApiCall = true
		req.socketIo = socketIo

		next()
	})
	
	router.use('/races', require('./races'))	
	router.use('/users', require('./users'))
	router.use('/pubs', require('./pubs'))
	router.use('/teams', require('./teams'))

	return router
}