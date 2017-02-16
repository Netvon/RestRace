const 	express = require('express'),
		router	= module.exports = express.Router()

router.get('/', (req, res, next) => {
	res.json(200, { id: 1, name: 'Tom'})
})

router.get('/:id', (req, res, next) => {	
	res.json(200, { id: 1, name: 'Tom', param: req.param('id', 0)})
})