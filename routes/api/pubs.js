const express = require('express'),
    router	= module.exports = express.Router(),
    mongoose = require('mongoose'),
    Pub = mongoose.model('Pub');


var GooglePlaces = require('google-places');

// api key
var places = new GooglePlaces('AIzaSyBNXXpKe8sc-_LIXSP6vdpdxDA3Tiz-p-E');



function searchPubs(req, res) {

    places.autocomplete({input: req.body.searchText, types: "establishment"}, function(err, response) {

        res.status(201).json(response.predictions);

    });


    // places.details({placeid: 'ChIJMQtSu3rExkcRcLhgyXD8f5w'}, function(err, response) {
    //     res.status(201).json(response.result);
    //
    // });
}



function getPlaceDetails(){

}





router.post('/search', (req, res, next) => {
    searchPubs(req,res)
})











