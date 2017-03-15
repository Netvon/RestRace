module.exports = function(app, express) {
	let router = express.Router()

	router.get('/', (req, res, next) => {
		res.render('index')
	})

	return router
}