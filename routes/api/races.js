const   express     = require('express'),
        router      = module.exports = express.Router(),
        mongoose    = require('mongoose'),
        Team        = require('../../models/team'),
        Race        = require('../../models/race'),
        { NotFoundError, ValidationError } = require('../../models/errors')

router.param('raceId', (req, res, next, raceId) => {
    req.requestedRaceId = raceId

    req.realtime.send('race-resolved', `Resolved Race with id '${raceId}'`)
    //req.fields
    let db = Race.findSingleById(raceId)

    if(req.fields && req.fields.length > 0)
        db = Race.findSingleById(raceId, req.fields.join(' '))

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


function getRaces(req, res, next) {

    if(res.race) {
        res.json(res.race)
    } else {

        let db = Race.findAll()
        Race.find({}, '', {})

        if(req.fields && req.fields.length > 0)
            db = Race.findAll(req.fields.join(' '))

        db.then(data => res.json(data))
            .catch(err => next(err))
    }
}


function addRace(req, res, next) {

    let race = new Race({
        name: req.body.name,
        description: req.body.description,
        starttime: new Date(req.body.starttime)
    })

    if(req.body.tags){
        req.body.tags.forEach(tag => race.tags.addToSet(tag))
    }

    race.save()
        .then(({_id, name, description, starttime, teams }) => {
            req.realtime.send('race-added', {_id, name, description, starttime })

            let addedTeams = []

            if(req.body.teams) {
                let teamPromises = []

                req.body.teams.forEach(teamName => {
                    teamPromises.push(race.addNewTeam(teamName))
                })

                Promise.all(teamPromises)
                    .then(ok => {

                        ok.forEach(t => {
                            addedTeams.push({_id: t._id, name: t.name})
                        })

                        res.setHeader('Location', `${req.originalUrl}/${_id}`)
                        res.status(201).json({_id, name, description, starttime, teams: addedTeams })  
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

    // Voorbeeld voor het verwijderen van alle teams in de race

    // Team.findById(req.params.teamId, function(err, team){
    //     return team.remove(function(err){
    //         if(!err) {
    //             Race.update({}, {$pull: {teams: team._id}}, function (err, numberAffected) {
    //                 console.log(numberAffected);
    //             })
    //         } else {
    //             console.log(err);
    //         }
    //         res.status(201).json({return:"return"})
    //     });
    // });

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


function newTeam(raceId, teamname, callback){
    console.log(teamname)
    var team = new Team({
        name: teamname
    })
    team.save().then(({_id}) => {
        Race.findByIdAndUpdate(raceId, {"$push": {"teams": _id}}, function(err, response){
            callback({_id:_id, name:teamname});
        })
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

// PATCH /api/races/:race_Id
router.patch('/:race_Id', updateRace)