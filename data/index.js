module.exports = { 
	connectDb(db = 'default', host = 'localhost' ) {
		const mongoose = require('mongoose')
		mongoose.connect(`mongodb://${host}/${db}`)
		mongoose.Promise = Promise
	}
}