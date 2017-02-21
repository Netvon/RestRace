

const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    Race = mongoose.model('Race');


var defaultTeamNames = ['Bavaria', 'Jupiler', 'Hertog jan', 'Brand', 'Amstel', 'Heineken']

function getTeams(req, res, next){
    var query = {};
    if(req.params.teamId){
        query._id = req.params.teamId;
    }

    var properties = "_id name users ranking endtime";

    Team.find(query, properties)
        .then(data => {
            if(req.params.id){
                data = data[0];
            }
            return res.json(data);
        })
}

function addTeam(req, res, next){

    if(!req.body.raceId){
        next();
    }

    Race.findById(req.body.raceId, function(err, response){
        if(err){
            res.json({message: "Error in finding race with id " + req.body.raceId});
        } else{

            let team = new Team({
                name: defaultTeamNames[response.teams.length],
            })

            team.save().then(({_id, name }) => {

                console.log(req.body.raceId)
                console.log(team._id)
                Race.findByIdAndUpdate(req.body.raceId, {"$push": {"teams": team._id}}).exec()

                res.setHeader('Location', req.originalUrl + '/' + _id)
                res.status(201).json({_id, name })
            }).catch(reason => {
                let error = new Error(reason)
                error.status = 500
                throw error
            })

        }
    });

}


function deleteTeam(req, res, next){

    Team.findByIdAndRemove(req.params.teamId, function(err, response){
        if(err){
            res.json({message: "Error in deleting team id " + req.params.teamId});
        } else{
            res.json({message: "Team with id " + req.params.teamId + " removed."});
        }
    });

}


// GET /api/teams
// GET /api/teams/:teamId
router.get('/:teamId?', getTeams)

// POST /api/teams
router.post('/', addTeam)

// DELETE /api/teams/:teamId
router.delete('/:teamId', deleteTeam)
