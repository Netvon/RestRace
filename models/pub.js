
const	mongoose	= require('mongoose'),
        slug		= require('mongoose-document-slugs'),

    pubSchema = new mongoose.Schema({
        lon: { type: Number, required: true},
        lat: { type: Number, required: true},
    })

// raceSchema.plugin(slug, { sourceField: 'name' })

module.exports =  mongoose.model('Pub', pubSchema)