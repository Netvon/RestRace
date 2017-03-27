const	mongoose	= require('mongoose')

pubSchema = new mongoose.Schema({
    name: { type: String, required: true},
    placeId: { type: String, required: true},
    lon: { type: Number, required: true},
    lat: { type: Number, required: true},
})

var GooglePlaces = require('google-places');
// api key
var places = new GooglePlaces('AIzaSyBNXXpKe8sc-_LIXSP6vdpdxDA3Tiz-p-E');



pubSchema.statics.findSingleById = function(placeId) {
    return this.findOne({placeId})
}

pubSchema.statics.createPub = function(pub) {
    return this.create({
        name: pub.name,
        placeId: pub.place_id,
        lat: pub.geometry.location.lat,
        lon: pub.geometry.location.lng
    })
}


module.exports = mongoose.model('Pub', pubSchema)