
const	mongoose	= require('mongoose'),
		slug		= require('mongoose-document-slugs'),
		Schema		= mongoose.Schema;

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
        type: Schema.ObjectId, ref:"Pub"
    }],

    teams: {
        type: [{ teamId:Schema.ObjectId }]
    },

    starttime: {
        type: Date,
        required: true,
    },

	tags: [String],
	
	meta: {
		createdOn: { type: Date, default: Date.now },
		isEnabled: { type: Boolean, default: true }
	}	
})

raceSchema.plugin(slug, { sourceField: 'name' })

mongoose.model('Race', raceSchema)