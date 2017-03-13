const express = require('express'),
	router	= module.exports = express.Router(),
	mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
	Race = mongoose.model('Race'),
    { NotFoundError, ValidationError } = require('../../models/errors')


let defaultTeamNames = [
    'Bavaria',
    'Jupiler',
    'Hertog jan',
    'Brand',
    'Amstel',
    'Heineken',
    'Grolsch',
    'Dommelsch',
    'Schultenbräu',
    'La Trappe',
    'Wieckse',
    'Erdinger',
    'Paulaner',
    'Duvel',
    'Hoegaarden',
    'La Chouffe',
    'Liefmans',
    'Palm',
]

router.param('raceId', (req, res, next, raceId) => {
    req.requestedRaceId = raceId

    req.socketIo.emit('race-resolved', `Resolved Race with id '${raceId}'`)

    Race.findSingleById(raceId)
        .then(race => {
            res.race = race
            next()
        })
        .catch(reason => {

            if('CastError' === err.name && 'ObjectId' === err.kind)
                next(new NotFoundError(`Race with id ${raceId} not found`))
            else
                next(reason)
        })
})


function getRaces(req, res, next) {

    if(res.race) {
        res.json(res.race)
    } else {
        Race.findAll()
            .then(data => res.json(data))
            .catch(err => next(err))
    }
}


function addRace(req, res, next){

    let race = new Race({
        name: req.body.name,
        description: req.body.description,
        starttime: new Date(req.body.starttime)
    })

    req.body.tags.forEach(tag => race.tags.addToSet(tag))    

    race.save()
        .then(({_id, name, description, starttime }) => {
            req.socketIo.emit('race-added', {_id, name, description, starttime })

            res.setHeader('Location', `${req.originalUrl}/${_id}`)
            res.status(201).json({_id, name, description, starttime })            
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
            res.status(200).json({ message: `Race with id ${req.requestedRaceId} removed`})
        })
        .catch(reason => next(reason))
}

function updateRace(req, res, next){

    Race.update({_id: req.params.race_Id }, { 
        name: req.body.name,
        starttime: req.body.starttime,
        status: req.body.starttime
    }, { $addToSet: req.body.tags })
    .then(updated => {
        res.status(201).json({message: `Race with id ${req.requestedRaceId} updated`})
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

// GET /api/races
// GET /api/races/:raceId
router.get('/:raceId?', getRaces)

// POST /api/races
router.post('/', addRace)

// POST /api/races/:raceId/addteam
router.post('/:raceId/addteam', addTeam)

// DELETE /api/races/:raceId
router.delete('/:raceId', deleteRace)

// PATCH /api/races/:raceId
router.patch('/:race_Id', updateRace)