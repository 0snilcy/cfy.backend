const { SECRET } = process.env
const logger = require('debug')('components:authenticate:')

const router = require('express').Router()
const { User } = require('../../db/models')

const expressJwt = require('express-jwt')
const { TokenExpiredError } = require('jsonwebtoken')
const { UnauthorizedError } = require('../../errors')

const { tokenService } = require('../../services/token.service')

router.post('/signin', async (req, res) => {
	const { body } = req
	const { email, password } = body

	if (email && password) {
		try {
			const user = await User.findOne({ email })
			if (user) {
				const verify = await user.comparePassword(password)

				if (verify) {
					return res.send({
						message: 'Hello ' + email,
						token: await tokenService.createToken(user.id),
					})
				}
			}
		} catch (err) {
			logger(err.message)
		}
	}

	res.status(401).send({
		message: 'Incorrect email or password',
	})
})

router.post('/signup', async (req, res, next) => {
	const { body } = req
	const { email, password } = body

	if (email && password) {
		try {
			const user = await User.findOne({ email })
			if (user) {
				return res.status(409).send({ message: 'User already exist' })
			}
		} catch (err) {
			return next(err)
		}

		const user = await User.create(body)

		return res.send({
			message: 'User was created',
			token: await tokenService.createToken(user.id),
		})
	}

	res.status(401).send({
		message: 'Incorrect email or password',
	})
})

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
		if (err instanceof UnauthorizedError) {
			if (err.inner instanceof TokenExpiredError) {
				const token = req.headers.authorization.split(' ')[1]
				const newToken = await tokenService.updateToken(token)

				return res.status(401).send({
					message: 'Expired token',
					token: newToken,
				})
			}

			res.status(err.status).send({
				message: err.message || 'Invalid token',
			})
		}
	},
]

module.exports = {
	router,
	isAuth,
}
