module.exports = function(app, express = require('express')) {
	let router = express.Router()
	let lodash = require('lodash')	

	router.use('*', (req, res, next) => {
		req.isApiCall = true
		req.realtime = app.get('realtime')

		next()
	})

	router.use((req, res, next) => {

		req.fields = []	
			
		if(req.query.fields)
			req.fields = req.query.fields.split(',')

		res.projectJson = (obj) => {
			if(req.fields && req.field.length > 0)
				res.json(lodash.pick(obj, req.fields))
			else
				res.json(obj)
		}

		next()
	})

	router.use((req, res, next) => {

		req.sortFields = []	
			
		if(req.query.sort) {
			let arr = req.query.fields.split(',') || []
			req.sort = {}

			for (var key in arr) {
				if (arr.hasOwnProperty(key)) {
					var element = arr[key];
					
				}
			}
		}
			

		res.projectJson = (obj) => {
			if(req.fields && req.field.length > 0)
				res.json(lodash.pick(obj, req.fields))
			else
				res.json(obj)
		}

		next()
	})
	
	router.use('/races', require('./races'))	
	router.use('/users', require('./users'))
	router.use('/pubs', require('./pubs'))
	router.use('/teams', require('./teams'))

	return router
}