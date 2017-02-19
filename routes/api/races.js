

var express = require('express'),
	router	= module.exports = express.Router(),
	mongoose = require('mongoose'),
	Race = mongoose.model('Race');


function getRaces(req, res){
    var query = {};
    if(req.params.raceId){
        query._id = req.params.raceId;
    }

    var properties = "_id name description starttime";

	Race.find(query, properties)
		.then(data => {
            if(req.params.id){
                data = data[0];
            }
            return res.json(data);
        })
}

function addRace(req, res){

    let race = new Race({
        name: req.body.name,
        description: req.body.description,
        starttime: new Date(req.body.starttime)
    })

    race.save().then(({_id, name, description, starttime }) => {
        res.setHeader('Location', req.originalUrl + '/' + _id)
        res.status(201).json({_id, name, description, starttime })
    }).catch(reason => {
        let error = new Error(reason)
        error.status = 500
        throw error
    })

}


function deleteRace(req, res){

    Race.findByIdAndRemove(req.params.raceId, function(err, response){
        if(err){
            res.json({message: "Error in deleting race id " + req.params.raceId});
        } else{
            res.json({message: "Race with id " + req.params.raceId + " removed."});
        }
    });

}

function updateRace(req, res){

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


// GET /api/races
// GET /api/races/:raceId
router.get('/:raceId?', (req, res, next) => {
    getRaces(req,res)
})

// POST /api/races
router.post('/', (req, res, next) => {
    addRace(req,res)
})

// DELETE /api/races/:raceId
router.delete('/:raceId', (req, res, next) => {
	deleteRace(req,res)
})

// PATCH /api/races/:raceId
router.patch('/:raceId', (req, res, next) => {
	updateRace(req,res)
})
