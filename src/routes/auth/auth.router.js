const { SECRET } = process.env

const logger = require('debug')('components:authenticate:')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { User } = require('../../db/models')
// const uuid = require('uuid/v4')
const expressJwt = require('express-jwt')

const tokenCreate = id => {
	return jwt.sign(id, SECRET)
}

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
						token: tokenCreate(user.id),
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
			token: tokenCreate(user.id),
		})
	}

	res.status(401).send({
		message: 'Incorrect email or password',
	})
})

const isAuth = [
	(req, res, next) => {
		req.body //?

		next()
	},
	expressJwt({
		secret: SECRET,
	}),
	(err, req, res, _next) => {
		if (err.name === 'UnauthorizedError') {
			res.status(401).send({
				message: 'Invalid token',
			})
		}
	},
	async (req, res, next) => {
		const userId = req.user

		try {
			const user = await User.findById(userId)

			if (!user) {
				res.status(401).send({
					message: 'Invalid user',
				})
			}

			req.user = await user.getPublicFields()
		} catch (err) {
			res.status(401).send({
				message: 'Invalid token',
			})
		}

		next()
	},
]

module.exports = {
	router,
	isAuth,
}
