const express = require('express'),
    router	= module.exports = express.Router(),
    Pub = require('../../models/pub')


var GooglePlaces = require('google-places');

// api key
var places = new GooglePlaces('AIzaSyBNXXpKe8sc-_LIXSP6vdpdxDA3Tiz-p-E');



function searchPubs(req, res) {

    places.autocomplete({input: req.body.searchText, types: "establishment"}, function(err, response) {

        res.status(200).json(response.predictions);

    });


    // places.details({placeid: 'ChIJMQtSu3rExkcRcLhgyXD8f5w'}, function(err, response) {
    //     res.status(201).json(response.result);
    //
    // });
}


function getPub(req, res, next){
    var query = {};

    query._id = req.params.pubId;

    var properties = "_id name placeId lon lat";

    Pub.find(query, properties)
        .then(data => {
            if(req.params.id){
                data = data[0];
            }
            return res.json(data);
        })
}

router.post('/search', searchPubs)
router.get('/:pubId', getPub)
