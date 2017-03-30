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

    owner: {
        type: Schema.ObjectId, ref:"User"
    },

    ranking: [{
        pub:{type: Schema.ObjectId, ref: "Pub"},
        time: Date
    }],

    endtime: {
        type: Date,
    },

    meta: {
        createdOn: { type: Date, default: Date.now },
        isEnabled: { type: Boolean, default: true }
    }
})

let defaultTeamNames = [
    'Bavaria',
    'Jupiler',
    'Hertog jan',
    'Brand',
    'Amstel',
    'Heineken',
    'Grolsch',
    'Dommelsch',
    'Schultenbräu',
    'La Trappe',
    'Wieckse',
    'Erdinger',
    'Paulaner',
    'Duvel',
    'Hoegaarden',
    'La Chouffe',
    'Liefmans',
    'Palm',
]

let defaultProjection = '_id name users ranking endtime'

teamSchema.statics.findAll = function() {
    return this.find({}, defaultProjection)
               .populate("users", "local.username races")
}

teamSchema.statics.findSingleById = function(_id) {
    return this.findOne({_id}, defaultProjection)
               .populate("users", "local.username races")
}

teamSchema.methods.removeUser = function() {

}

teamSchema.methods.addUser = function() {

}

teamSchema.statics.createWithNameOrDefaultName = function(teamName = null) {
    return this.create({
        name:  teamName || defaultTeamNames[~~Math.random() * defaultTeamNames.length]
    })
}

teamSchema.statics.findAndAddRanking = function (_id, pubIds) {

    return new Promise((resolve, reject) => {
        this.findOne({_id}, defaultProjection)
            .populate("users", "firstname lastname races")
            .then(team => {
                pubIds.forEach(function (item, index) {
                    team.ranking.push({pub:item, time:new Date()})
                })

                team.save(function(err, team) {
                    resolve(team)
                })
                    .catch(err => reject(err))

            })
            .catch(err => reject(err))
    })

}

// raceSchema.plugin(slug, { sourceField: 'name' })

module.exports = mongoose.model('Team', teamSchema)