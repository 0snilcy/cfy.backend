const { SECRET } = process.env
const User = require('../../db/models/user')

const expressJwt = require('express-jwt')
const { TokenExpiredError } = require('jsonwebtoken')
const { UnauthorizedError } = require('../../errors')

const { tokenService } = require('../../services/token.service')

const isAuth = [
	expressJwt({
		secret: SECRET,
	}),
	async (req, res, next) => {
		if (!req.user.sid) {
			return next(new UnauthorizedError('Invalid token'))
		}

		const userId = await tokenService.getUserId(req.user)

		try {
			const user = await User.findById(userId)

			if (!user) {
				return next(new UnauthorizedError('Invalid token'))
			}

			req.user = await user.getPublicFields()
		} catch (err) {
			return next(new UnauthorizedError(err.message))
		}

		next()
	},
	async (err, req, res, _next) => {
		if (err.inner && err.inner instanceof TokenExpiredError) {
			const token = req.headers.authorization.split(' ')[1]
			const newToken = await tokenService.updateToken(token)

			console.log('Expired token')

			return res.status(401).send({
				message: 'Expired token',
				token: newToken,
			})
		}

		res.status(err.status).send({
			message: err.message || 'Invalid token',
		})
	},
]

module.exports = {
	isAuth,
}
