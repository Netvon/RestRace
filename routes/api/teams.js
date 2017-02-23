

const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    Race = mongoose.model('Race');


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


function deleteTeam(req, res, next){

    Team.findByIdAndRemove(req.params.teamId, function(err, response){
        if(err){
            res.json({message: "Error in deleting team id " + req.params.teamId});
        } else{
            res.json({message: "Team with id " + req.params.teamId + " removed."});
        }
    });

}

function addUser(req, res, next){

    User.findById(req.body.userId, function (err, response){
        if(err){
            res.json({message: "Error in finding user with id " + req.body.userId});
        }
        else{
            Team.findByIdAndUpdate(req.params.teamId, {"$push": {"users": response._id}}, {new: true})
                .then(({_id, name, users, ranking, endtime }) => {
                res.setHeader('Location', req.originalUrl + '/' + _id)
                res.status(201).json({_id, name, users, ranking, endtime})
            })
                .catch(reason => {
                    let error = new Error(reason)
                    error.status = 500
                    throw error
                })
        }
    });

}


// GET /api/teams
// GET /api/teams/:teamId
router.get('/:teamId?', getTeams)

// POST /api/teams/:teamId/adduser
router.post('/:teamId/adduser', addUser)

// DELETE /api/teams/:teamId
router.delete('/:teamId', deleteTeam)
