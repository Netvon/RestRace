module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated, isInRole } = require('../middlewares/auth')

	router.get('/', isLocalAuthenticated, (req, res, next) => {
		res.renderWithDefaults('index')
	})

	router.get('/' + encodeURIComponent('😎'), (req, res, next) => { 
		res.send("You're a cool guy, huh?")
	})

	return router
}