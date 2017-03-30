const	mongoose	= require('mongoose'),
		slug		= require('mongoose-document-slugs'),
		Schema		= mongoose.Schema

var GooglePlaces = require('google-places');
// api key
var places = new GooglePlaces('AIzaSyBNXXpKe8sc-_LIXSP6vdpdxDA3Tiz-p-E');

var raceSchema = new mongoose.Schema({
	name: { type: String, required: true},
	description: String,

	status: {
		type: String,
		default: 'notstarted',
		enum: {
			values: ['notstarted', 'started', 'ended']
		}
	},
	
	creator: {
        type: Schema.ObjectId, ref: 'User'
    },

    pubs: [{
        type: Schema.ObjectId, ref: 'Pub'
    }],

    teams: [{
        type: Schema.ObjectId, ref: 'Team'
    }],

    starttime: {
        type: Date,
        required: true,
    },

	tags: [String]

}, { timestamps: true })

const defaultProjection = '_id name description status starttime pubs teams tags creator'
const defaultPopulate = [{
	path: 'teams',
	model: 'Team',
	select: '_id name users ranking',
	options: { sort: { name: 1 } },
	populate: {
		path: 'users',
		model: 'User',
		select: '_id firstname lastname'
	}
}, {
    path: 'pubs',
    model: 'Pub',
    select: '_id name lon lat',
}, {
	path: 'creator',
	model: 'User',
	select: '_id local.username'
}]

raceSchema.statics.findAll = function(projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.find({}, projection).populate(populateOptions)
}

raceSchema.statics.findSingleById = function(_id, projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.findOne({ _id }, projection).populate(populateOptions)
}

raceSchema.statics.findSingle = function(params, projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.findOne(params, projection).populate(populateOptions)
}

raceSchema.statics.updateFromObject = function(id, object) {
	let setTags = null

	if(object.tags && typeof object.tags === 'array') {
		setTags = { $addToSet: object.tags }
	}

	delete object._id
	delete object.pubs
	delete object.teams
	delete object.owner


	return this.findOneAndUpdate({ _id: id }, object, setTags, { runValidators: true })
}

raceSchema.methods.addNewTeam = function(teamName) {
	return new Promise((resolve, reject) => {
		require('./team').createWithNameOrDefaultName(teamName)
		.then(newTeam => {
			this.update({ $push: { 'teams': newTeam._id } })
				.then(ok => resolve(newTeam))
				.catch(err => reject(err))
		})
		.catch(err => reject(err))
	})
}

raceSchema.methods.addNewPub = function(placeId) {
    return new Promise((resolve, reject) => {
    	var pub = require('./pub');
        pub.findSingleById(placeId)
            .then(newPub => {
            	var self = this;
            	if(newPub){
                    this.update({ $push: { "pubs": newPub._id } })
                        .then(ok => resolve(newPub))
                        .catch(err => reject(err))
				}
				else{
                    places.details({placeid: placeId}, function(err, response) {
                        pub.createPub(response.result)
							.then(newPub => {
                                self.update({ $push: { "pubs": newPub._id } })
                                    .then(ok => resolve(newPub))
                                    .catch(err => reject(err))
                        })

                    });
				}


            })
            .catch(err => reject(err))
    })
}

raceSchema.plugin(slug, { sourceField: 'name' })

module.exports = mongoose.model('Race', raceSchema)