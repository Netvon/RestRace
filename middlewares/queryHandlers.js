module.exports.sortable = (req, res, next) => {

	if(req.query.sort) {
		req.sortFields = req.query.sort.split(',').join(' ')
	}

	next()
}

module.exports.projectable = (req, res, next) => {
			
	if(req.query.fields)
		req.fields = req.query.fields.split(',').join(' ')

	next()
}

module.exports.limitable = (req, res, next) => { 
	if(req.query.limit) {
		req.limit = Number.parseInt(req.query.limit)
	}

	next()
}

module.exports.skippable = (req, res, next) => { 
	if(req.query.skip) {
		req.skip = Number.parseInt(req.query.skip)
	}

	next()
}