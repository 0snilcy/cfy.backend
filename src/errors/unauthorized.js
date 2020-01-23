const ErrorHandler = require('./error')

class UnauthorizedError extends ErrorHandler {
	constructor(message) {
		super(message)

		this.name = 'UnauthorizedError'
		this.status = 401
	}
}

module.exports = UnauthorizedError
