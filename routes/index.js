module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated, isInRole } = require('../middlewares/auth')

	router.get('/', isLocalAuthenticated, (req, res, next) => {

		console.log(req.i18n('Hello, World!'))

		res.render('index', { user: req.user, notifications: req.flash() })
	})

	// router.get('/signup', (req, res, next) => {
	// 	if(req.isAuthenticated())
	// 		res.redirect('/')
	// 	else
	// 		res.render('signup', { notifications: req.flash() })
	// })

	// router.get('/login', (req, res, next) => {
	// 	if(req.isAuthenticated())
	// 		res.redirect('/')
	// 	else
	// 		res.render('login', { notifications: req.flash(), i18n: req.i18n })
	// })

	router.get('/' + encodeURIComponent('😎'), (req, res, next) => { 
		res.send("You're a cool guy, huh?")
	})

	return router
}