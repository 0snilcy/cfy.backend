const logger = require('debug')('components:graphql:auth ')

const User = require('../../db/models/user')

const { tokenService } = require('../../services/token.service')

const createUser = async ({ data }) => {
	const { email, password } = data
	if (!email || !password) {
		throw new Error('Invalid data')
	}

	try {
		const user = await User.findOne({ email })
		if (user) {
			throw new Error('User alrady exist')
		}
	} catch (err) {
		throw new Error(err.message)
	}

	const user = await User.create({
		email,
		password,
	})

	return {
		email,
		id: user.id,
		token: await tokenService.createToken(user.id),
	}
}

const login = async ({ data }) => {
	const { email, password } = data
	logger('Login', email, password)

	if (email && password) {
		try {
			const user = await User.findOne({ email })
			if (user) {
				const verify = await user.comparePassword(password)

				if (verify) {
					return {
						...user.getPublicFields(),
						token: await tokenService.createToken(user.id),
					}
				}
			}
		} catch (err) {
			throw new Error(err.message)
		}
	}

	throw new Error('Incorrect email or password')
}

module.exports = {
	// query
	login,

	// mutation
	createUser,
}
