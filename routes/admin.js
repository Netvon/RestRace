module.exports = function(app, express) {
	let router = express.Router()
	let { isLocalAuthenticated, isInRole } = require('../middlewares/auth')

	router.use(isLocalAuthenticated, isInRole('admin'))

	router.get('/', (req, res, next) => { 
		res.renderWithDefaults('admin/index')
	})

	router.get('/users', (req, res, next) => { 
		res.renderWithDefaults('admin/users/index')
	})

	router.get('/users/create', (req, res, next) => {
		res.renderWithDefaults('admin/users/create')
	})

	router.get('/users/:userId/edit', async (req, res, next) => {
		res.renderWithDefaults('admin/users/edit', { userId: req.params.userId })
	})

	return router
}