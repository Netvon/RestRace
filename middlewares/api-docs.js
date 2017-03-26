module.exports = function(app) {
	let swaggerUi	= require('swagger-ui-express'),
		swaggerDoc	= require('../docs/swagger.json')

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
}