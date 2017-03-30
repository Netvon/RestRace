const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    qh = require('../../middlewares/queryHandlers'),
    { NotFoundError, ValidationError } = require('../../models/errors'),
    Team = require('../../models/team'),
    User = require('../../models/user'),
    Race = require('../../models/race')


router.param('teamId', (req, res, next, teamId) => {
    qh.projectable(req, res, () => {})

    req.requestedTeamId = teamId

    let db = Team.findSingleById(raceId, req.fields)

    db.then(team => {
        if(team === null)
            next(new NotFoundError(`Team with id ${teamId} not found`))
        else {
            res.team = team
            next()
        }            
    })
    .catch(err => {

        if('CastError' === err.name && 'ObjectId' === err.kind)
            next(new NotFoundError(`Team with id ${teamId} not found`))
        else
            next(err)
    })
})


async function getTeams(req, res, next) {

    if(res.team) {
        res.json(res.team)
    } else {

        try {
            let teams = await qh.applyToDb(req, Team.findAll(req.fields))
            res.paginate(teams, await Team.count())
        } catch (error) {
            next(error)
        }        
    }
}

function deleteTeam(req, res, next) {

    Team.findById(req.params.teamId, function(err, team) {
        return team.remove(function(err) {
            if(!err) {
                Race.update({}, {$pull: {teams: team._id}}, function (err, numberAffected) {
                        console.log(numberAffected);
                })
            } else {
                console.log(err);
            }
            res.status(201).json({return:"return"})
        });
    });


    // Team.findByIdAndRemove(req.params.teamId, function(err, response){
    //     if(err){
    //         res.json({message: "Error in deleting team id " + req.params.teamId});
    //     } else{
    //         res.json({message: "Team with id " + req.params.teamId + " removed."});
    //     }
    // });

}

function addUser(req, res, next){

    User.findById(req.body.userId, function (err, response){
        if(err){
            res.json({message: "Error in finding user with id " + req.body.userId});
        }
        else{
            Team.findByIdAndUpdate(req.params.teamId, {"$push": {"users": response._id}}, {new: true})
                .populate("users", "firstname lastname")
                .then(({_id, name, users, ranking, endtime }) => {
                res.setHeader('Location', req.originalUrl + '/' + _id)
                res.status(201).json({_id, name, users, ranking, endtime})
            })
                .catch(reason => {
                    next(reason)
                })
        }
    });

}

function removeUser(req, res, next){

    User.findById(req.body.userId, function (err, response){
        if(err){
            res.json({message: "Error in finding user with id " + req.body.userId});
        }
        else{
            Team.findByIdAndUpdate(req.params.teamId, {"$pull": {"users": response._id}}, {new:true})
                .populate("users", "firstname lastname")
                .then(({_id, name, users, ranking, endtime }) => {
                    res.setHeader('Location', req.originalUrl + '/' + _id)
                    res.status(201).json({_id, name, users, ranking, endtime})
                })
                .catch(reason => {
                    next(reason)
                })
        }
    });

}

// GET /api/teams
// GET /api/teams/:teamId
router.get('/:teamId?', ...qh.all(), getTeams)

// POST /api/teams/:teamId/adduser
router.post('/:teamId/adduser', addUser)

// POST /api/teams/:teamId/adduser
router.post('/:teamId/removeuser', removeUser)

// DELETE /api/teams/:teamId
router.delete('/:teamId', deleteTeam)
