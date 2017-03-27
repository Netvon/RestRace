module.exports = function(app) {

	app.use((req, res, next) => {
		let err = new Error('Nothing Found')
		err.status = 404

		next(err)
	})

	// setup global error handler
	app.use((err, req, res, next) => {
		

		err.status = err.status || 500

		let errObj = { error: {} }

		for (let i in Object.getOwnPropertyDescriptors(err)) {

			if(process.env.NODE_ENV === 'production' && i == 'stack')
				continue

			errObj.error[i] = err[i]
		}

		console.error(errObj)

		res.status(err.status)
		if(req.isApiCall) {
			res.json(errObj)
		} else {
			res.render('error', errObj)
		}

		app.get('realtime').send('error', errObj)

		return
	})
}