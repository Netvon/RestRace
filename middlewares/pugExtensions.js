module.exports = function(app) {

	app.use((req, res, next) => {

		res.renderWithDefaults = (view, scope = {}) => {
			scope.notifications = req.flash()
			scope.i18n = req.i18n
			scope.user = req.user

			res.render(view, scope)
		}

		next()
	})
	
}