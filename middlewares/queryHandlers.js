function paginate(req, res) { 
	return (collection, totalItems) =>{

		if(req.limit && (req.skip == null))
			req.skip = 0

		if(req.limit && req.skip >= 0) {

			let next = req.skip + req.limit
			let nextUrl = `${req.baseUrl}?limit=${req.limit}&skip=${next}`

			if(req.query.sort)
				nextUrl += `&sort=${req.query.sort}`

			if(req.query.fields)
				nextUrl += `&fields=${req.query.fields}`

			if(next >= totalItems)
				nextUrl = undefined

			res.json({
				totalPages: Math.ceil(totalItems/req.limit),
				totalItems: totalItems,
				limit: req.limit,
				skip: req.skip,
				next: nextUrl,
				items: collection
			})
		} else {
			res.json(collection)
		}
		
	}
}

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
	if(!res.paginate) {
		res.paginate = paginate(req, res)
	}

	if(req.query.limit) {
		req.limit = Number.parseInt(req.query.limit)
	}

	next()
}

module.exports.skippable = (req, res, next) => { 
	if(!res.paginate) {
		res.paginate = paginate(req, res)
	}

	if(req.query.skip) {
		req.skip = Number.parseInt(req.query.skip)
	}

	next()
}