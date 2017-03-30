function paginate(req, res, next) { 
	return (collection, totalItems) => {

		if(req.limit && (req.skip == null))
			req.skip = 0

		if(req.limit && req.skip >= 0) {

			let page = 1
			if(req.skip > 0)
				page = (req.skip / req.limit) + 1

			let prev = req.skip - req.limit
			let next = req.skip + req.limit

			let nextUrl = `${req.baseUrl}?limit=${req.limit}&skip=${next}`
			let prevUrl = `${req.baseUrl}?limit=${req.limit}&skip=${prev}`

			if(req.query.sort) {
				nextUrl += `&sort=${req.query.sort}`
				prevUrl += `&sort=${req.query.sort}`
			}

			if(req.query.fields) {
				nextUrl += `&fields=${req.query.fields}`
				prevUrl += `&fields=${req.query.fields}`
			}

			if(next >= totalItems)
				nextUrl = undefined

			if(page <= 1)
				prevUrl = undefined

			res.json({
				totalPages: Math.ceil(totalItems/req.limit),
				currentPage: page,
				totalItems: totalItems,
				limit: req.limit,
				skip: req.skip,
				next: nextUrl,
				prev: prevUrl,
				items: collection
			})
		} else {
			res.json(collection)
		}
		
	}
}

function sortable(req, res, next) {

	if(req.query.sort) {
		req.sortFields = req.query.sort.split(',').join(' ')
	}

	next()
}

function projectable (req, res, next) {
			
	if(req.query.fields)
		req.fields = req.query.fields.split(',').join(' ')

	next()
}

function limitable (req, res, next) { 
	if(!res.paginate) {
		res.paginate = paginate(req, res, next)
	}

	if(req.query.limit) {
		req.limit = Math.min(Number.parseInt(req.query.limit), 100)
	}

	next()
}

function skippable(req, res, next) { 
	if(!res.paginate) {
		res.paginate = paginate(req, res, next)
	}

	if(req.query.skip) {
		req.skip = Number.parseInt(req.query.skip)
	}

	next()
}

function applyToDb(req, db) {
	if(req.sortFields)
		db = db.sort(req.sortFields)

	if(req.limit)
		db = db.limit(req.limit)

	if(req.skip !== null && req.skip !== undefined && req.skip > 1)
		db = db.skip(req.skip)

	return db
} 

module.exports.applyToDb = applyToDb
module.exports.sortable = sortable
module.exports.projectable = projectable
module.exports.limitable = limitable
module.exports.skippable = skippable
module.exports.all = () => {
	return [
		sortable,
		projectable,
		limitable,
		skippable
	]
}