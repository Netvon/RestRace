const	mongoose	= require('mongoose'),
		Schema		= mongoose.Schema,
	{ NotFoundError, ValidationError, UnauthorizedError } = require('./errors')

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
	populate: [{
		path: 'users',
		model: 'User',
		select: '_id local.username races'
	},{
        path: 'ranking.pub',
        model: 'Pub',
        select: '_id name'
    }]
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

raceSchema.statics.findByCreator = function(userId, projection = defaultProjection, populateOptions = defaultPopulate) {
    return this.find({ creator: userId }, projection).populate(populateOptions)
}

raceSchema.statics.findByTeamIds =  function(teamIds, projection = defaultProjection, populateOptions = defaultPopulate) {
    return this.find({teams: { $in: teamIds }}, projection).populate(populateOptions)   
}

raceSchema.methods.updateWith = function(object) {
	
    if(object.name && object.name !== "" && object.name !== this.name)
        this.name = object.name

    if(object.status && object.status !== "" && object.status !== this.status)
        this.status = object.status

    if(object.tags && Array.isArray(object.tags))
        object.tags.forEach(r => this.tags.addToSet(r))

    if(object.starttime && object.starttime !== "" && object.starttime !== this.starttime)
        this.starttime = object.starttime

    if(object.description && object.description !== "" && object.description !== this.description)
        this.description = object.description

	return this.save()
}

raceSchema.methods.addNewTeam = function(teamName) {

    let Team = require('./team')

    return Team.createWithNameOrDefaultName(teamName)
        .then(newTeam => {
            this.teams.push(newTeam)

            return this.save()
        })

	// return new Promise((resolve, reject) => {
	// 	require('./team').createWithNameOrDefaultName(teamName)
	// 	.then(newTeam => {
	// 		this.update({ $push: { 'teams': newTeam._id } })
	// 			.then(ok => resolve(newTeam))
	// 			.catch(err => reject(err))
	// 	})
	// 	.catch(err => reject(err))
	// })
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

raceSchema.methods.checkLocation = function(raceId, teamId, lon, lat) {
    return new Promise((resolve, reject) => {
        require('./race').findSingleById(raceId, "pubs", [{path: 'pubs', model: 'Pub', select: '_id placeId name lon lat'}])
            .then(race => {
                if(race){
                    var pubRankings = [];
                    var team = require('./team');
                    var maxDiff = 0.0001;
                    race.pubs.forEach(function (item, index) {
						if(lon <= item.lon+maxDiff && lon >= item.lon-maxDiff && lat <= item.lat+maxDiff && lat >= item.lat-maxDiff){
							pubRankings.push(item._id)
						}
                    })

                    team.findAndAddRanking(teamId, pubRankings)
                        .then(team => {
                            resolve(team);
                        })
                        .catch(err => reject(err))
                }
            })
            .catch(err => reject(err))
    })
}

raceSchema.methods.getUserTeam = function(raceId, userId) {
    return new Promise((resolve, reject) => {

        this.teams.forEach(function (team, index) {
            team.users.forEach(function (user, index) {
                if(user._id.equals(userId)){
                    resolve(team)

                }
            })
        })

        reject(new NotFoundError(`Team with user ${userId} not found`))
    })
}

module.exports = mongoose.model('Race', raceSchema)