

const express = require('express'),
	router	= module.exports = express.Router(),
	mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
	Race = mongoose.model('Race');


var defaultTeamNames = [
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


function getRaces(req, res, next){
    var query = {};
    if(req.params.raceId){
        query._id = req.params.raceId;
    }

    var properties = "_id name description status starttime pubs teams";

	Race.find(query, properties)
        .populate({
            path: 'teams',
            model: 'Team',
            select: '_id name users ranking',
            populate: {
                path: 'users',
                model: 'User',
                select: '_id firstname lastname'
            }
        })
		.then(data => {
            if(req.params.id){
                data = data[0];
            }
            return res.json(data);
        })
}

function addRace(req, res, next){

    let race = new Race({
        name: req.body.name,
        description: req.body.description,
        starttime: new Date(req.body.starttime)
    })

    race.save().then(({_id, name, description, starttime }) => {

        var teams = []
        req.body.teams.forEach(function (item, index) {
            newTeam(_id, item);
            teams.push({name:item})
        })

        res.setHeader('Location', req.originalUrl + '/' + _id)
        res.status(201).json({_id, name, description, starttime, teams})
    }).catch(reason => {
        let error = new Error(reason)
        error.status = 500
        throw error
    })

}


function deleteRace(req, res, next){


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


    Race.findByIdAndRemove(req.params.raceId, function(err, response){
        if(err){
            res.json({message: "Error in deleting race id " + req.params.raceId});
        } else{
            res.json({message: "Race with id " + req.params.raceId + " removed."});
        }
    });

}

function updateRace(req, res, next){

    Race.findByIdAndUpdate(req.params.raceId, req.body)
        .then(({_id, name, description, starttime }) => {
        res.setHeader('Location', req.originalUrl + '/' + _id)
        res.status(201).json({_id, name, description, starttime })
    })
        .catch(reason => {
        let error = new Error(reason)
        error.status = 500
        throw error
    })

}


function newTeam(raceId, teamname){
    console.log(teamname)
    var team = new Team({
        name: teamname
    })
    team.save().then(({_id}) => {
        Race.findByIdAndUpdate(raceId, {"$push": {"teams": _id}}).exec()
    })
}


function addTeam(req, res, next){

    Race.findById(req.params.raceId, function(err, response){
        if(err){
            res.json({message: "Error in finding race with id " + req.params.raceId});
        } else{
            var teamname = req.body.name;
            if(!teamname){
                teamname = defaultTeamNames[response.teams.length]
            }

            let team = new Team({
                name: teamname,
            })

            team.save().then(({_id, name }) => {
                Race.findByIdAndUpdate(req.params.raceId, {"$push": {"teams": team._id}}).exec()

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
router.patch('/:raceId', updateRace)
