module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated } = require('../middlewares/auth')

	router.get('/', isLocalAuthenticated, (req, res, next) => {
		res.render('index', { user: req.user, notifications: req.flash() })
	})

	router.get('/signup', (req, res, next) => {
		if(req.isAuthenticated())
			res.redirect('/')
		else
			res.render('signup', { notifications: req.flash() })
	})

	router.get('/login', (req, res, next) => {
		if(req.isAuthenticated())
			res.redirect('/')
		else
			res.render('login', { notifications: req.flash() })
	})

	return router
}