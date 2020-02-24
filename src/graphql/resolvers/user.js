const User = require('../../db/models/user')

const profile = async (data, req) => {
	console.log('get profile')
	console.log(req.headers)
}

const getUsers = async () => {
	try {
		return await User.find()
	} catch (err) {
		throw new Error(err.message)
	}
}

const getUser = async ({ email, id }) => {
	try {
		if (id) {
			const user = await User.findById(id)
			return user.getPublicFields()
		}

		return await User.findOne({ email })
	} catch (err) {
		throw new Error(err.message)
	}
}

module.exports = {
	profile,

	getUser,
	getUsers,
}
