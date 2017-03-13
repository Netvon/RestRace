module.exports = function(express, io) {
	let router = express.Router()

	router.get('/', (req, res, next) => {
		res.render('index')
	})

	return router
}