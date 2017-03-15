const	mongoose	= require('mongoose'),
        slug		= require('mongoose-document-slugs'),
        Schema		= mongoose.Schema;

var userSchema = new mongoose.Schema({

    firstname: {
        type:String,
        required: true
    },

    lastname: {
        type: String
    },

    races:[{
        type: Schema.ObjectId, ref:"Race"
    }],

    meta: {
        createdOn: { type: Date, default: Date.now },
        isEnabled: { type: Boolean, default: true }
    }
})

// raceSchema.plugin(slug, { sourceField: 'name' })

mongoose.model('User', userSchema)