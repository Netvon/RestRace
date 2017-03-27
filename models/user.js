const	mongoose	= require('mongoose'),
        bcrypt      = require('bcryptjs'),
        mongooseHidden = require('mongoose-hidden')(),
        Schema		= mongoose.Schema

var userSchema = new mongoose.Schema({

    local: {
        username: {
            type:String,
            required: true,
            unique: true,
            lowercase: true
        },

        password: {
            type:String,
            required: true,
            hide: true
        },
    },

    roles: {
		type: [String],
		default: ['user'],
        lowercase: true
	},

    firstname: {
        type:String
    },

    lastname: {
        type: String
    },

    races: [{
        type: Schema.ObjectId, ref: 'Race'
    }]

}, { timestamps: true })

userSchema.plugin(mongooseHidden)

userSchema.pre('save', function(next) {
    this.local.password = bcrypt.hashSync(this.local.password, 10)
    
    next()
})

userSchema.virtual('fullName').get(function() {
    return `${this.firstname} ${this.lastname}`
})

userSchema.statics.validateUsernamePassword = async function(username, password) {
    let user = await this.findOne({'local.username': username })

    if(user == null)
        return false

    return { valid: user.validatePassword(password), user }
}

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

userSchema.methods.isInRole = function(role) {
    return this.roles.includes(role)
}

module.exports = mongoose.model('User', userSchema)