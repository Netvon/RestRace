const 	express = require('express'),
		router	= module.exports = express.Router(),
		Race	= require('../../models/race')

router.param('raceId', (req, res, next, raceId) => {
	Race.findById(raceId, 'name description meta')
	.then(result => {
		req.requestedRaceId = raceId

		if(result === null) {
			let error = new Error('Race not found')
			error.status = 404
			throw error
		} else {
			req.race = result
			next()
		}
	})
	.catch(err => {
		next(err)
	})
})

// GET /api/users
router.get('/', (req, res, next) => {
	let opt = {isActive: true},
		proj = 'name description'

	if(req.query.showInactive) {
		opt = {}
		proj += ' isActive'
	}

	Race.find(opt, proj).then(data => {
		res.json(data)
	})
})

// GET /api/users/:raceId
router.get('/:raceId', (req, res, next) => {
	res.json(req.race)
})

// POST /api/users
router.post('/', (req, res, next) => {
	let race = new Race({ name: req.body.name, description: req.body.description })

	race.save().then(({_id, name, description }) => {
		res.setHeader('Location', req.originalUrl + '/' + _id)
		res.status(201).json({_id, name, description })
	}).catch(reason => {
		let error = new Error(reason)
		error.status = 500
		throw error
	})
})

// DELETE /api/users/:raceId
router.delete('/:raceId', (req, res, next) => {
	Race.update()
	Race.findByIdAndRemove(req.requestedRaceId)
})

// PATCH /api/users/:raceId
router.patch('/:raceId', (req, res, next) => {
	Race.findByIdAndUpdate(req.requestedRaceId)
})