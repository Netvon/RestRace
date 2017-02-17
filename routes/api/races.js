const 	express = require('express'),
		router	= module.exports = express.Router(),
		Race = require('../../models/race')

// GET /api/races
router.get('/', (req, res, next) => {
	Race.find({}, "_id name description").then(data => {
		res.json(data)
	})
})

// GET /api/races/:raceId
router.get('/:raceId', (req, res, next) => {
	res.json(req.race)
})

// POST /api/races
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

// DELETE /api/races/:raceId
router.delete('/:raceId', (req, res, next) => {
	Race.update()
	Race.findByIdAndRemove(req.requestedRaceId)
})

// PATCH /api/races/:raceId
router.patch('/:raceId', (req, res, next) => {
	Race.findByIdAndUpdate(req.requestedRaceId)
})