module.exports = function(app = require('express')(), location) {

	let path = require('path')
	let fs = require('fs')
	let format = require('string-format')
	let acceptLanguage = require('accept-language').create()
	acceptLanguage.languages(['en-US', 'nl-NL'])

	// let strings = require(location)

	app.use((req, res, next) => {
		let language = req.query.lang || acceptLanguage.get(req.header('Accept-Language'))
		
		req.i18n = (key, ...format) => {

			let output = key

			if(language) {
				let filePath = path.join(location, language + '.json')

				if(fs.existsSync(filePath)) {
					let file = JSON.parse(fs.readFileSync(filePath))

					output = file[key] || key
				}
			}

			return format(output, ...format) 
		}

		next()
	})
}