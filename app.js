// create constants
const 	express 	= require('express'),
		app			= express(),
		pug 		= require('pug'),
		path 		= require('path'),
		bodyParser 	= require('body-parser'),
		connectDb	= require('./data'),
		swaggerUi	= require('swagger-ui-express'),
		swaggerDoc	= require('./docs/swagger.json'),
		cors		= require('cors')


// connect data layer
connectDb('rest-race').catch(err => console.log(err))

// import models
require('./models/race')
require('./models/user')
require('./models/team')
require('./models/pub')

// setup view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// setup middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

// setup routes middleware
app.use('/', require('./routes/index')(app, express))
app.use('/api', require('./routes/api')(app, express))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// setup final middleware
app.use((req, res, next) => {
	let err = new Error('Nothing Found')
	err.status = 404

	next(err)
})

// setup global error handler
app.use((err, req, res, next) => {
	let status = err.status || 500

	res.status(status)
	if(req.isApiCall) {
		res.json({ error: err })
	} else {
		res.render('error', { message: err.message, status })
	}
})

module.exports = app