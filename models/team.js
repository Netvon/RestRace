
const	mongoose	= require('mongoose'),
        slug		= require('mongoose-document-slugs'),
        Schema		= mongoose.Schema;

var teamSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },

    users: [{
        type: Schema.ObjectId, ref:"User"
    }],

    ranking: [{
        pub:{type: Schema.ObjectId, ref: "Pub"},
        pubPassed:Boolean,
        timePassed: Date
    }],

    endtime: {
        type: Date,
    },

    tags: [String],

    meta: {
        createdOn: { type: Date, default: Date.now },
        isEnabled: { type: Boolean, default: true }
    }
})

// raceSchema.plugin(slug, { sourceField: 'name' })

mongoose.model('Team', teamSchema)