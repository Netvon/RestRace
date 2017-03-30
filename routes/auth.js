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
			res.renderWithDefaults('register')
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
			res.renderWithDefaults('login')
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

		req.isApiCall = true
		
		let passportJWT = require('passport-jwt')
		let {AuthentificationError} = require('../models/errors')

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

			if(args === false) {
				next(AuthentificationError('User not Found'))
			}
			else if(args.valid) {

				var payload = { 
					sub: args.user.id,
					iss: req.protocol + '://' + req.get('host')
				}

				var token = jwt.sign(payload, jwtOptions.secretOrKey, {
					expiresIn: '1d'
				})

				res.json({ message: "ok", token: token })

			} else {
				next(AuthentificationError('Password did not match'))
			}
		}
	})

	router.get('/auth/me', isJWTAuthenticated, function(req, res) {
		res.json(req.user)
	})

	router.get('/me', isLocalAuthenticated, function(req, res) {
		res.renderWithDefaults('me')
	})

	return router
}