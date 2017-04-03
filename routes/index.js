module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated, isInRole } = require('../middlewares/auth')

	router.get('/', isLocalAuthenticated, (req, res, next) => {
		res.renderWithDefaults('index')
	})

	router.get('/' + encodeURIComponent('😎'), (req, res, next) => { 
		res.send("You're a cool guy, huh?")
	})

	// router.get('/admin', isLocalAuthenticated, isInRole('admin'), (req, res, next) => { 
	// 	res.renderWithDefaults('admin/index')
	// })

	// router.get('/admin/users', isLocalAuthenticated, isInRole('admin'), (req, res, next) => { 
	// 	res.renderWithDefaults('admin/users/index')
	// })

	// router.get('/admin/users/create', isLocalAuthenticated, isInRole('admin'), (req, res, next) => {
	// 	res.renderWithDefaults('admin/users')
	// })

	return router
}