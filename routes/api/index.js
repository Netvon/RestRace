const 	express = require('express'),
		router	= module.exports = express.Router()

router.use('*', (req, res, next) => {
	req.isApiCall = true
	next()
})


router.use('/races', require('./races'))
router.use('/users', require('./users'))