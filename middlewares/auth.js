let passport = require('passport')

module.exports.useAuth = function(app = require('express')()) {
	
	useLocal(app)
	useJwt(app)
	useFacebook(app)

}

module.exports.isLocalAuthenticated = (req, res, next) => {
	if(req.isAuthenticated())
		next()
	else
		res.redirect('/login')
}

module.exports.isJWTAuthenticated = passport.authenticate('jwt', { session: false })/*(req, res, next) => {
	if(req.isAuthenticated())
		next()
	else {
		res.header('WWW-Authenticate', 'Bearer token_type="JWT"') 
		res.status(401).json({ error: { status: 401, message: 'Unauthorized' }})
	}
}*/

module.exports.isInRole = function(role) {

	let { UnauthorizedError } = require('../models/errors')

	return (req, res, next) => {
		if(req.isAuthenticated()) {
			if(req.user.roles && req.user.roles.length > 0 && req.user.roles.includes(role))
				next()
			else {
				next(UnauthorizedError())
			}
				
		}
	}	
}

function useFacebook(app) {

	if(!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET)
		throw new Error('Facebook Environment Variables not found (FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET)')

	let FacebookStrategy = require('passport-facebook').Strategy


	passport.use(new FacebookStrategy({
		clientID: process.env.FACEBOOK_CLIENT_ID,
		clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/auth/facebook/callback',
		passReqToCallback: true
	},
		async function(req, accessToken, refreshToken, profile, cb) {

			req.facebookAuth = { 
				accessToken, refreshToken, profile
			}

			if(req.isAuthenticated()) {
				try {
					await req.user.update({ 'social.facebookId': profile.id })
					cb(null, req.user)
				} catch(error) {
					cb(error, req.user)
				}
				

			} else {
				let User = require('../models/user')
				
				try {
					let user = await User.findOne({ 'social.facebookId': profile.id })

					if(!user)
						user = await User.create({ 'local.username': profile.displayName || profile.id, 'social.facebookId': profile.id })

					cb(null, user)
				} catch(error) {
					cb(error)
				}
			}
			
			
		}
	))

	app.get('/auth/facebook',
		passport.authenticate('facebook'));

	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', { failureRedirect: '/login' }),
		(req, res) => {
			if(!req.isApiCall)
				res.redirect('/')
			else
				res.json(req.facebookAuth)
		})
}

function useLocal(app) {
	/** local */
	let cookieParser = require('cookie-parser')
	let session = require('express-session')	
	let LocalStrategy = require('passport-local').Strategy

	let User = require('../models/user')
	
	app.use(cookieParser())
	app.use(session ( {
		secret: process.env.SESSION_SECRET || 'default',
		resave: false,
		saveUninitialized: true
	}))

	passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await User.findById(id)
		done(null, user)
    })

	
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(require('connect-flash')())

	passport.use('local-login', new LocalStrategy ({ passReqToCallback: true },
		async function(req, username, password, done) {
			try {
				let args = await User.validateUsernamePassword(username, password)

				if(args.valid)
					done(null, args.user, req.flash('success', 'You have been logged in' ))
				else
					done(null, null, req.flash('danger', 'Signin failed'))

			} catch (error) {
				done(err, null, req.flash('danger', 'Signin failed'))
			}
		}
	))

	passport.use('local-signup', new LocalStrategy({ passwordField: 'password', usernameField: 'username', passReqToCallback: true },
		async function(req, username, password, done) {
			try {
				let user = await User.create({'local.username': username, 'local.password': password })

				done(null, user, req.flash('success', 'Your account has been created'))
			} catch (error) {
				done(error, false, req.flash('danger', 'Signup failed'))
			}
			
		}
	))

	// app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect : '/',
    //     failureRedirect : '/signup',
    //     failureFlash : true,
	// 	successFlash: true
    // }))

	// app.post('/login', passport.authenticate('local-login', {
    //     successRedirect : '/',
    //     failureRedirect : '/login',
    //     failureFlash : true,
	// 	successFlash: true
    // }))

	// app.get('/logout', (req, res, next) => {
	// 	req.logout()
	// 	res.redirect('/login')
	// })
}

function useJwt(app) {
	/** JWT */
	let jwt = require('jsonwebtoken')

	let passportJWT = require('passport-jwt')

	let ExtractJwt = passportJWT.ExtractJwt
	let JwtStrategy = passportJWT.Strategy

	let jwtOptions = {
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: process.env.JWT_SECRET || 'default'
	}

	let User = require('../models/user')
	
	let strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {

		let user = await User.findOne({ _id: jwt_payload.sub })

		if (user) {
			next(null, user);
		} else {
			next(null, false);
		}
	})

	passport.use(strategy)
	app.use(passport.initialize())

	// app.post('/auth/token', async (req, res, next) => {

	// 	if(req.isAuthenticated())
	// 		console.log('psst, i also work with local :)')

	// 	if(req.body.username && req.body.password) {
	// 		let args = await User.validateUsernamePassword(req.body.username, req.body.password)

	// 		if(args.valid) {

	// 			var payload = { 
	// 				sub: args.user.id,
	// 				iss: req.protocol + '://' + req.get('host')
	// 			}

	// 			var token = jwt.sign(payload, jwtOptions.secretOrKey, {
	// 				expiresIn: '1d'
	// 			})

	// 			res.json({ message: "ok", token: token })

	// 		} else {
	// 			res.status(401).json({ message: 'Auth failed' })
	// 		}
	// 	}
	// })

	// app.get("/auth/me", passport.authenticate('jwt', { session: false }), function(req, res) {
	// 	res.json(req.user);
	// })
}