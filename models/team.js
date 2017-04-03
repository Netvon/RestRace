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
    }
}, { timestamps: true })

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
let defaultPopulation = [{
    path: 'users',
    model: 'User',
    select: '_id local.username races'
},{
    path: 'ranking.pub',
    model: 'Pub',
    select: '_id name'
}]

teamSchema.statics.findAll = function() {
    return this.find({}, defaultProjection)
               .populate(defaultPopulation)
}

teamSchema.statics.findSingleById = function(_id) {
    return this.findOne({_id}, defaultProjection)
               .populate(defaultPopulation)
}

teamSchema.methods.addUser = function(userId) {
    this.users.push(userId)

    return this.save()
}

teamSchema.methods.removeUser = function(userId) {
    let index = this.users.indexOf(userId)

    if(index >= 0) {
        this.users.splice(index, 1)       
    }

    return this.save()
}

teamSchema.statics.createWithNameOrDefaultName = function(teamName = null) {
    return this.create({
        name:  teamName || defaultTeamNames[~~Math.random() * defaultTeamNames.length]
    })
}

teamSchema.statics.findAndAddRanking = function (_id, pubIds) {

    return new Promise((resolve, reject) => {
        this.findOne({_id}, defaultProjection)
            .populate(defaultPopulation)
            .then(team => {
                pubIds.forEach(function (item, index) {

                    var alreadyRanked = false;
                    team.ranking.forEach(function (rank, index) {
                        if(rank.pub._id.equals(item)){
                            alreadyRanked = true;
                        }
                    })
                    if(!alreadyRanked){
                        team.ranking.push({pub:item, time:new Date()})
                    }
                })

                team.save(function(err, team) {
                    team.populate(defaultPopulation, function (err, team) {
                        resolve(team)
                    })
                })
                    .catch(err => reject(err))

            })
            .catch(err => reject(err))
    })

}

// raceSchema.plugin(slug, { sourceField: 'name' })

module.exports = mongoose.model('Team', teamSchema)