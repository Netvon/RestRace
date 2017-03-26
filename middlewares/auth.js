module.exports = function(app = require('express')()) {
	/** local */
	// let sessions = require('express-session')
	// let passport = require('passport')
	// let LocalStrategy = require('passport-local').Strategy

	// let User = require('../models/user')
	
	// app.use(require('express-session')({
	// 	secret: process.env.SESSION_SECRET || 'default',
	// 	resave: false,
	// 	saveUninitialized: false
	// }))
	

	// app.use(passport.initialize())
	// app.use(passport.session())

	// passport.use(new LocalStrategy (
	// 	async function(username, password, done) {
	// 		try {
	// 			let args = await User.validateUsernamePassword(username, password)

	// 			if(args.valid)
	// 				done(null, args.user)
	// 			else
	// 				done(null, false)

	// 		} catch (error) {
	// 			done(err)
	// 		}
	// 	}
	// ))

	/** JWT */
	let passport = require('passport')
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

	app.post('/auth/token', async (req, res, next) => {
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

	app.get("/auth/me", passport.authenticate('jwt', { session: false }), function(req, res){
		res.json(req.user);
	})

}