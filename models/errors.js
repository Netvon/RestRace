function NotFoundError(message = 'Resource not found', status = 404) {
	let error = new Error(message)
	error.name = 'NotFoundError'
	error.status = status

	return error
}

function InternalServerError(message = 'Internal Server Error', status = 500) {
	let error = new Error(message)
	error.name = 'InternalServerError'
	error.status = status

	return error
}

function BadRequestError(info, message = 'Bad Request', status = 400) {
	let error = new Error(message)
	error.name = 'BadRequestError'
	error.status = status
	error.info = info

	return error
}

function ValidationError(validationErrors, message = 'Validation Error', status = 400) {
	let error = new Error(message)
	error.name = 'ValidationError'
	error.status = status

	error.validationErrors = {}

	Object.getOwnPropertyNames(validationErrors).forEach(x => {
		error.validationErrors[x] = {
			kind: validationErrors[x].kind,
			message: validationErrors[x].message
		}
	})

	return error
}

module.exports = {
	NotFoundError,
	InternalServerError,
	BadRequestError,
	ValidationError
}