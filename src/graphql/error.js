const { ApolloError } = require('apollo-server-express')

const CODE = {
	EXPIRED_TOKEN: 'EXPIRED_TOKEN',
}

class ExpiredError extends ApolloError {
	constructor(err) {
		super(err.message, CODE.EXPIRED_TOKEN, err)
	}
}

module.exports = {
	ExpiredError,
	CODE,
}
