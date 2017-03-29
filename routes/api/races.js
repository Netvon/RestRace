const   express     = require('express'),
        router      = module.exports = express.Router(),
        mongoose    = require('mongoose'),
        Team        = require('../../models/team'),
        Race        = require('../../models/race'),
        Pub         = require('../../models/pub'),
        qh          = require('../../middlewares/queryHandlers'),
        {isJWTAuthenticated} = require('../../middlewares/auth'),
        { NotFoundError, ValidationError } = require('../../models/errors'),
        GooglePlaces = require('google-places'),
        places = new GooglePlaces('AIzaSyDTnFknpxRhzZHkCegKD0IhjfYWxb-WU14')

router.param('raceId', (req, res, next, raceId) => {
    qh.projectable(req, res, () => {})

    req.requestedRaceId = raceId

    req.realtime.send('race-resolved', `Resolved Race with id '${raceId}'`)
    //req.fields
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
    .catch(reason => {

        if('CastError' === err.name && 'ObjectId' === err.kind)
            next(new NotFoundError(`Race with id ${raceId} not found`))
        else
            next(reason)
    })
})


async function getRaces(req, res, next) {

    if(res.race) {
        res.json(res.race)
    } else {

        let db = Race.findAll()

        if(req.fields)
            db = Race.findAll(req.fields)

        if(req.sortFields)
            db = db.sort(req.sortFields)

        if(req.limit)
            db = db.limit(req.limit)

        if(req.skip !== null || req.skip !== undefined)
            db = db.skip(req.skip)

        let count = await Race.count()
        db.then(data => res.paginate(data, count))
          .catch(err => next(err))
    }
}


function addRace(req, res, next) {

    let race = new Race({
        name: req.body.name,
        description: req.body.description,
        starttime: new Date(req.body.starttime)
    })

    if(req.body.tags) {
        req.body.tags.forEach(tag => race.tags.addToSet(tag))
    }

    race.save()
        .then(({ _id, name, description, starttime, teams, pubs }) => {
            req.realtime.send('race-added', { _id, name, description, starttime })

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

    

    Race.update({ _id: req.params.race_Id }, { 
        name: req.body.name,
        starttime: req.body.starttime,
        status: req.body.starttime
    }, { $addToSet: req.body.tags })
    .then(updated => {
        res.status(201).json({ message: `Race with id ${req.requestedRaceId} updated` })
    })
    .catch(reason => {
        if('ValidationError' === reason.name)
            next(new ValidationError(reason.errors, reason.message))
        else
            next(reason)
    })

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



// GET /api/races
// GET /api/races/:raceId
router.get('/:raceId?', qh.projectable, qh.limitable, qh.skippable, qh.sortable, getRaces)

// POST /api/races
router.post('/', isJWTAuthenticated, addRace)

// POST /api/races/:raceId/addteam
router.post('/:raceId/addteam', isJWTAuthenticated, addTeam)

// POST /api/races/:raceId/checklocation
router.post('/:raceId/checklocation', isJWTAuthenticated, checkLocation)

// DELETE /api/races/:raceId
router.delete('/:raceId', isJWTAuthenticated, deleteRace)

// PATCH /api/races/:race_Id
router.patch('/:race_Id', isJWTAuthenticated, updateRace)