const	mongoose	= require('mongoose'),
		slug		= require('mongoose-document-slugs'),
		Schema		= mongoose.Schema

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

	tags: [String],
	
	meta: {
		createdOn: { type: Date, default: Date.now },
		updatedOn: { type: Date },
		isEnabled: { type: Boolean, default: true }
	}	
}, { timestamps: true })

const defaultProjection = '_id name description status starttime pubs teams'
const defaultPopulate = {
	path: 'teams',
	model: 'Team',
	select: '_id name users ranking',
	options: { sort: { name: 1 } },
	populate: {
		path: 'users',
		model: 'User',
		select: '_id firstname lastname'
	}
}

raceSchema.statics.findAll = function(projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.find({}, projection).populate(populateOptions)
}

raceSchema.statics.findSingleById = function(_id, projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.findOne({ _id }, projection).populate(populateOptions)
}

raceSchema.statics.findSingle = function(params, projection = defaultProjection, populateOptions = defaultPopulate) {
	return this.findOne(params, projection).populate(populateOptions)
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

raceSchema.plugin(slug, { sourceField: 'name' })

module.exports = mongoose.model('Race', raceSchema)