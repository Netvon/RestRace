module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated, isInRole } = require('../middlewares/auth')

	router.get('/', isLocalAuthenticated, isInRole('admin'), (req, res, next) => {

		console.log(req.i18n('Hello, World!'))

		res.renderWithDefaults('index')
	})

	router.get('/' + encodeURIComponent('😎'), (req, res, next) => { 
		res.send("You're a cool guy, huh?")
	})

	router.get('/admin', isLocalAuthenticated, isInRole('admin'), (req, res, next) => { 
		res.renderWithDefaults('admin/index')
	})

	return router
}