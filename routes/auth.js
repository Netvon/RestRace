module.exports = function(app, express) {
	let router = express.Router(),
		{ isLocalAuthenticated, isInRole, isJWTAuthenticated } = require('../middlewares/auth'),
		passport = require('passport'),
		User = require('../models/user'),
		jwt = require('jsonwebtoken')

	router.get('/register', (req, res, next) => {
		if(req.isAuthenticated())
			res.redirect('/')
		else
			res.render('register', { notifications: req.flash() })
	})

	router.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true,
		successFlash: true
    }))

	router.get('/login', (req, res, next) => {
		if(req.isAuthenticated())
			res.redirect('/')
		else
			res.render('login', { notifications: req.flash(), i18n: req.i18n })
	})	

	router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true,
		successFlash: true
    }))

	router.get('/logout', (req, res, next) => {
		req.logout()
		res.redirect('/login')
	})


	router.post('/auth/token', async (req, res, next) => {

		let passportJWT = require('passport-jwt')

		let ExtractJwt = passportJWT.ExtractJwt
		let JwtStrategy = passportJWT.Strategy

		let jwtOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeader(),
			secretOrKey: process.env.JWT_SECRET || 'default'
		}

		if(req.isAuthenticated())
			console.log('psst, i also work with local :)')

		if(req.body.username && req.body.password) {
			let args = await User.validateUsernamePassword(req.body.username, req.body.password)

			if(args.valid) {

				var payload = { 
					sub: args.user.id,
					iss: req.protocol + '://' + req.get('host')
				}

				var token = jwt.sign(payload, jwtOptions.secretOrKey, {
					expiresIn: '1d'
				})

				res.json({ message: "ok", token: token })

			} else {
				res.status(401).json({ message: 'Auth failed' })
			}
		}
	})

	router.get('/auth/me', isJWTAuthenticated, function(req, res) {
		res.json(req.user)
	})

	router.get('/me', isLocalAuthenticated, function(req, res) {
		res.render('me', {user: req.user})
	})

	return router
}