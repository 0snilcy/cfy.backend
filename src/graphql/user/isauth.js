const User = require('../../db/models/user')
const tokenService = require('../../services/token.service')
const { TokenExpiredError } = require('jsonwebtoken')
// const { formatError } = require('graphql')
const { AuthenticationError } = require('apollo-server-express')
const { ExpiredError } = require('../error')

const isAuthResolver = async function(_, __, { req }) {
	if (!req) {
		throw Error('Invalid context')
	}

	const header = req.headers.Authorization || req.headers.authorization
	if (header) {
		const [type, token] = header.split(' ')
		if (type === 'Bearer' && token) {
			try {
				const session = tokenService.verify(token)

				if (session) {
					const userId = await tokenService.getUserId(session)
					const user = await User.findById(userId)

					if (!user) {
						return new AuthenticationError('Invalid token')
					}

					req.token = token
					return user.getPublicFields()
				}
			} catch (err) {
				if (err instanceof TokenExpiredError) {
					const newToken = await tokenService.updateToken(token)
					if (newToken) {
						err.token = newToken
						throw new ExpiredError(err)
					}
				}

				throw new AuthenticationError('Invalid token')
			}
		}
	}

	throw new AuthenticationError('Invalid Authentication')
}

module.exports = isAuthResolver
