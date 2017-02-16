const 	mongoose 	= require('mongoose'),
		slug 		= require('mongoose-document-slugs'),
		name 		= 'Race',

raceSchema = new mongoose.Schema({
	name: { type: String, required: true},
	description: String,

	status: {
		type: String,
		default: 'notstarted',
		enum: {
			values: ['notstarted', 'started', 'ended']
		}
	},
	
	meta: {
		createdOn: { type: Date, default: Date.now },
		isEnabled: { type: Boolean, default: true }
	}	
})

raceSchema.plugin(slug, { sourceField: 'name' })

module.exports = mongoose.model(name, raceSchema)