// create constants
const 	express 	= require('express'),
		app			= express(),
		pug 		= require('pug'),
		path 		= require('path'),
		bodyParser 	= require('body-parser'),
		connectDb	= require('./helpers/db'),
		useApiDocs	= require('./middlewares/api-docs'),
		useErrors	= require('./middlewares/errorHandling'),
		useI18n		= require('./middlewares/i18n'),
		{useAuth}	= require('./middlewares/auth'),
		usePugExtensions = require('./middlewares/pugExtensions'),
		cors		= require('cors')

// connect data layer
connectDb('rest-race').catch(console.log)

// setup view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// setup middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

useI18n(app, path.join(__dirname, 'i18n'))
useAuth(app)
usePugExtensions(app)

// setup routes middleware
app.use('/', require('./routes/auth')(app, express), require('./routes/index')(app, express))
app.use('/api', require('./routes/api')(app, express))
app.use('/admin', require('./routes/admin')(app, express))

useApiDocs(app)
useErrors(app)

module.exports = app