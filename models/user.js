const	mongoose	= require('mongoose'),
        bcrypt      = require('bcryptjs'),
        mongooseHidden = require('mongoose-hidden')(),
        Schema		= mongoose.Schema

var userSchema = new mongoose.Schema({

    local: {
        username: {
            type:String,
            unique: true,
            lowercase: true
        },

        password: {
            type:String,
            hide: true
        },
    },

    social: {
        facebookId: {
            type: String,
            hide: true
        }
    },

    roles: [{
		type: String,
		default: ['user'],
        lowercase: true,
        enum: ['user', 'admin']
	}],

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

userSchema.plugin(mongooseHidden, { hidden: { _id: false } })

userSchema.pre('save', function(next) {
    if(this.local.password && this.isModified('local.password'))
        this.local.password = bcrypt.hashSync(this.local.password, 10)

    if(!this.isInRole('user'))
        this.roles.push('user')
    
    next()
})

const defaultProjection = '_id fullName local.username roles'

userSchema.statics.findAll = function(projection = defaultProjection, populateOptions = '') {
    if(populateOptions == null)
	    return this.find({}, projection)
    
    return this.find({}, projection).populate(populateOptions)
}

userSchema.statics.findSingleById = function(_id, projection = defaultProjection, populateOptions = '') {
	return this.findOne({ _id }, projection).populate(populateOptions)
}

userSchema.virtual('fullName').get(function() {
    if(!this.firstname && !this.lastname)
        return undefined

    return `${this.firstname || ''} ${this.lastname || ''}`
})

userSchema.virtual('hasFacebook').get(function() {
    return this.social.facebookId != null
})

userSchema.methods.removeFacebook = function() {
    this.social.facebookId = null

    return this.save()
}

userSchema.statics.validateUsernamePassword = async function(username, password) {
    if(!username || !password)
        return false

    let user = await this.findOne({'local.username': username })

    if(user == null)
        return false

    return { valid: user.validatePassword(password), user }
}

userSchema.methods.validatePassword = function(password) {
    if(!this.local.password)
        return false

    return bcrypt.compareSync(password, this.local.password)
}

userSchema.methods.isInRole = function(role) {
    return this.roles.includes(role)
}

userSchema.methods.updateWith = function(object) {
    if(object.username && object.username !== "" && object.username !== this.local.username)
        this.local.username = object.username
    if(object.password && object.password !== "")
        this.local.password = object.password
    if(object.roles && Array.isArray(object.roles))
        object.roles.forEach(r => this.roles.addToSet(r))
    if(object.firstname && object.firstname !== "" && object.firstname !== this.firstname)
        this.firstname = object.firstname
    if(object.lastname && object.lastname !== "" && object.lastname !== this.lastname)
        this.lastname = object.lastname

    return this.save()
}

module.exports = mongoose.model('User', userSchema)