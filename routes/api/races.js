const   express     = require('express'),
		router      = module.exports = express.Router(),
		mongoose    = require('mongoose'),
		request     = require('request-promise-native'),
		Team        = require('../../models/team'),
		Race        = require('../../models/race'),
		Pub         = require('../../models/pub'),
		qh          = require('../../middlewares/queryHandlers'),
		{isJWTAuthenticated, combineAuth} = require('../../middlewares/auth'),
		{ NotFoundError, ValidationError, UnauthorizedError } = require('../../models/errors'),
		GooglePlaces = require('google-places'),
		places = new GooglePlaces('AIzaSyDTnFknpxRhzZHkCegKD0IhjfYWxb-WU14')

router.param('raceId', (req, res, next, raceId) => {
	qh.projectable(req, res, () => {})

	req.requestedRaceId = raceId

	let { realtime } = require('../../helpers/realtime')
	realtime.send('race-resolved', `Resolved Race with id '${raceId}'`)

	let db = Race.findSingleById(raceId)

	if(req.fields && req.fields.length > 0)
		db = Race.findSingleById(raceId, req.fields)

	db.then(race => {
		if(race === null)
			next(new NotFoundError(`Race with id ${raceId} not found`))
		else {
			res.race = race
			next()
		}            
	})
	.catch(err => {

		if('CastError' === err.name && 'ObjectId' === err.kind)
			next(new NotFoundError(`Race with id ${raceId} not found`))
		else
			next(err)
	})
})


async function getRaces(req, res, next) {

	if(res.race) {
		res.json(res.race)
	} else {

		try {
			let races = await qh.applyToDb(req, Race.findAll(req.fields))
			res.paginate(races, await Race.count())
		} catch (error) {
			next(error)
		}        
	}
}


function addRace(req, res, next) {

	let race = new Race({
		name: req.body.name,
		description: req.body.description,
		starttime: new Date(req.body.starttime),
		creator: req.user._id
	})

	if(req.body.tags) {
		req.body.tags.forEach(tag => race.tags.addToSet(tag))
	}

	race.save()
		.then(({ _id, name, description, starttime, teams, pubs }) => {

			let { realtime } = require('../../helpers/realtime')
			realtime.send('race-added', { _id, name, description, starttime })

			let addedTeams = []
			let addedPubs = []

			if(req.body.teams || req.body.pubs) {
				let allPromises = []

				req.body.teams.forEach(teamName => {
					allPromises.push(race.addNewTeam(teamName))
				})
				req.body.pubs.forEach(pub => {
					allPromises.push(race.addNewPub(pub.place_id))
				})

				Promise.all(allPromises)
					.then(ok => {

						console.log('allFinished');

						ok.forEach(t => {
							if(t.placeId){
								addedPubs.push({_id: t._id, name: t.name})
							}
							else{
								addedTeams.push({_id: t._id, name: t.name})
							}

						})

						res.setHeader('Location', `${req.originalUrl}/${_id}`)
						res.status(201).json({_id, name, description, starttime, teams: addedTeams, pubs: addedPubs })
					})
					.catch(err => {
						next(err)
					})     
			}
			else{
				res.setHeader('Location', `${req.originalUrl}/${_id}`)
				res.status(201).json({_id, name, description, starttime, teams })
			}

		})
		.catch(reason => {
			if('ValidationError' === reason.name) {
				next(new ValidationError(reason.errors, reason.message))
			} else {
				next(reason)
			}
		})

}

/**
 * @param {Request} req 
 * @param {Response} res 
 * @param {any} next 
 */
function deleteRace(req, res, next) {

	res.race.remove()
		.then(race => {
			res.status(200).json({ message: `Race with id ${req.requestedRaceId} removed` })
		})
		.catch(reason => next(reason))
}

function updateRace(req, res, next) {

	if(req.user.roles.includes('admin') || req.user.id  === res.race.owner.id ) {

		res.race.updateWith(req.body)

		//  Race.update({ _id: req.params.race_Id }, { 
		// 	name: req.body.name,
		// 	description: req.body.description,
		// 	starttime: req.body.starttime,
		// 	status: req.body.starttime
		// }, { $addToSet: req.body.tags }, { runValidators: true })
		.then(updated => {
			let { realtime } = require('../../helpers/realtime')

			realtime.send('updated', updated)

			res.status(200).json({ message: `Race with id ${updated.id} updated` })
		})
		.catch(reason => {
			if('ValidationError' === reason.name)
				next(new ValidationError(reason.errors, reason.message))
			else
				next(reason)
		})
	} else {
		next(UnauthorizedError('You do not have sufficient rights to edit this Race'))
	}   

}


function addTeam(req, res, next){

	res.race.addNewTeam(req.body.name)
		.then(x => res.status(201).json(x))
		.catch(reason => next(reason))

}


function checkLocation(req, res, next) {

	res.race.checkLocation(req.params.raceId, req.body.teamId, req.body.lon, req.body.lat)
		.then(x => res.status(201).json(x))
		.catch(reason => next(reason))

}

function getUserTeam(req, res, next) {

	res.race.getUserTeam(req.params.raceId, req.user._id)
		.then(x => res.status(201).json(x))
		.catch(reason => next(reason))

}

function getRankingImage(req, res, next) {

    Team.findSingleById(req.params.teamId).then(participatingTeam => {
        let mapsrc = "https://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&size=600x300"
        res.race.pubs.forEach(function (item, index) {
            let color = "red"
            if(participatingTeam.ranking ) {
                participatingTeam.ranking.forEach(function (rank, index) {
                    if(item._id.equals(rank.pub._id)) {
                        color= "green"
                    }
                })
            }

            mapsrc += "&markers=color:"+color+"%7C"+item.lat+","+item.lon
        })
        mapsrc += "&key=AIzaSyDTnFknpxRhzZHkCegKD0IhjfYWxb-WU14"


        var requestSettings = {
            url: mapsrc,
            method: 'GET',
            encoding: null
        };

        request(requestSettings).then(function(body) {
            res.set('Content-Type', 'image/png')
            res.send(body)
        })
    })

}


// GET /api/races
// GET /api/races/:raceId
router.get('/:raceId?', combineAuth, ...qh.all(), getRaces)

router.get('/:raceId/getuserteam', isJWTAuthenticated, getUserTeam)

router.get('/:raceId/getrankingimage/:teamId', getRankingImage)

// POST /api/races
router.post('/', isJWTAuthenticated, addRace)

// POST /api/races/:raceId/addteam
router.post('/:raceId/addteam', isJWTAuthenticated, addTeam)

// POST /api/races/:raceId/checklocation
router.post('/:raceId/checklocation', isJWTAuthenticated, checkLocation)

// DELETE /api/races/:raceId
router.delete('/:raceId', isJWTAuthenticated, deleteRace)

// PUT /api/races/:race_Id
router.put('/:raceId', isJWTAuthenticated, updateRace)