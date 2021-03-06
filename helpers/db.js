/**
 * 
 * 
 * @param {string} [db='default'] 
 * @param {string} [host='localhost'] 
 * @returns {Promise}
 */
function connectDb(db, host = 'localhost' ) {

	return new Promise((resolve, reject) => {
		let mongoose = require('mongoose')

		mongoose.Promise = Promise
		mongoose.connect(process.env.MONGO_DB || `mongodb://${host}/${db}`)
			.then(ok => resolve(ok))
			.catch(err => reject(err))
	})		
}

module.exports = connectDb