module.exports = function(app, express = require('express')) {
	let router = express.Router()
	let lodash = require('lodash')	

	router.use('*', (req, res, next) => {
		req.isApiCall = true
		req.realtime = app.get('realtime')

		next()
	})

	// router.use((req, res, next) => {

	// 	req.fields = []	
			
	// 	if(req.query.fields)
	// 		req.fields = req.query.fields.split(',')

	// 	res.projectJson = (obj) => {
	// 		if(req.fields && req.field.length > 0)
	// 			res.json(lodash.pick(obj, req.fields))
	// 		else
	// 			res.json(obj)
	// 	}

	// 	next()
	// })

	// router.use((req, res, next) => {

	// 	req.sortFields = ''
			
	// 	if(req.query.sort) {
	// 		req.sortFields = req.query.sort.split(',').join(' ')
	// 		// let arr = req.query.sort.split(',')			

	// 		// for (var key in arr) {
	// 		// 	if(arr[key].endsWith(':desc'))
	// 		// 		req.sortFields[arr[key]] = (Number.parseInt(key) + 1) * -1
	// 		// 	else
	// 		// 		req.sortFields[arr[key]] = Number.parseInt(key) + 1
	// 		// }	
	// 	}

	// 	next()
	// })
	
	router.use('/races', require('./races'))	
	router.use('/users', require('./users'))
	router.use('/pubs', require('./pubs'))
	router.use('/teams', require('./teams'))

	return router
}