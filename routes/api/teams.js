const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    qh = require('../../middlewares/queryHandlers'),
    { NotFoundError, ValidationError, UnauthorizedError } = require('../../models/errors'),
    { isJWTAuthenticated } = require('../../middlewares/auth'),
    Team = require('../../models/team'),
    User = require('../../models/user'),
    Race = require('../../models/race')


router.param('teamId', (req, res, next, teamId) => {
    qh.projectable(req, res, () => {})

    req.requestedTeamId = teamId

    let db = Team.findSingleById(teamId, req.fields)

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
                .populate("users", "local.username races")
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
                .populate("users", "local.username races")
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

function updateTeam(req, res, next) {
    if(req.user.roles.includes('admin') || req.user.id  === res.team.owner.id ) {

		res.team.updateWith(req.body)
		.then(updated => {
			let { realtime } = require('../../helpers/realtime')

			realtime.sendToRoom(`teams/${updated.id}`, 'updated', updated)

			res.status(201).json({ message: `Team with id ${updated.id} updated` })
		})
		.catch(reason => {
			if('ValidationError' === reason.name)
				next(new ValidationError(reason.errors, reason.message))
			else
				next(reason)
		})
	} else {
		next(UnauthorizedError('You do not have sufficient rights to edit this Team'))
	}   
}

// GET /api/teams
// GET /api/teams/:teamId
router.get('/:teamId?', ...qh.all(), getTeams)

// PUT /api/teams/:teamId
router.put('/:teamId', isJWTAuthenticated, updateTeam)

// POST /api/teams/:teamId/adduser
router.post('/:teamId/adduser', isJWTAuthenticated, addUser)

// POST /api/teams/:teamId/adduser
router.post('/:teamId/removeuser', isJWTAuthenticated, removeUser)

// DELETE /api/teams/:teamId
router.delete('/:teamId', isJWTAuthenticated, deleteTeam)
