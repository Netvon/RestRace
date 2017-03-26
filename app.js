// create constants
const 	express 	= require('express'),
		app			= express(),
		pug 		= require('pug'),
		path 		= require('path'),
		bodyParser 	= require('body-parser'),
		connectDb	= require('./data'),
		useApiDocs	= require('./middlewares/api-docs'),
		useErrors	= require('./middlewares/errorHandling'),
		useAuth		= require('./middlewares/auth'),
		cors		= require('cors')


// connect data layer
connectDb('rest-race').catch(err => console.log(err))

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

useAuth(app)
useApiDocs(app)
useErrors(app)

module.exports = app