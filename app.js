// create constants
const 	express 	= require('express'),
		app			= express(),
		pug 		= require('pug'),
		path 		= require('path'),
		bodyParser 	= require('body-parser'),
		{connectDb}	= require('./data')

// connect data layer
connectDb('rest-race')

// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// setup middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

// setup routes middleware
app.use('/', require('./routes/index'))
app.use('/api/users', require('./routes/api/users'))
app.use('/api/races', require('./routes/api/races'))

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
	res.render('error', { message: err.message, status })
})

// export final express app
module.exports = app