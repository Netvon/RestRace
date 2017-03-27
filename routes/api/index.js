module.exports = function(app, express = require('express')) {
	let router = express.Router()

	router.use((req, res, next) => {
		req.isApiCall = true
		req.realtime = app.get('realtime')

		next()
	})
	
	router.use('/races', require('./races'))	
	router.use('/users', require('./users'))
	router.use('/pubs', require('./pubs'))
	router.use('/teams', require('./teams'))

	return router
}