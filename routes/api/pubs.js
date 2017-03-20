const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    Pub = mongoose.model('Pub');


var GooglePlaces = require('google-places');

// api key
var places = new GooglePlaces('AIzaSyDTnFknpxRhzZHkCegKD0IhjfYWxb-WU14');



function searchPubs(req, res) {

    // places.search({keyword: 'Caramba'}, function(err, response) {
    //     console.log("search: ", response);
    //
    //     // places.details({reference: response.results[0].reference}, function(err, response) {
    //     //     console.log("search details: ", response.result.website);
    //     //     // search details:  http://www.vermonster.com/
    //     // });
    // });


    places.autocomplete({input: req.body.searchText, types: "establishment"}, function(err, response) {

    var success = function(err, response) {
        console.log("did you mean: ", response.result.name);
    };

    for(var index in response.predictions) {
        places.details({reference: response.predictions[index].reference}, success);
    }

    res.status(201).json(response.predictions);

    });


}


router.post('/search', (req, res, next) => {
    searchPubs(req,res)
})











