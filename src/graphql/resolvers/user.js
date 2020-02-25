const User = require('../../db/models/user')

const profile = async (data, req) => {
	console.log(req.user)
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

const updateUser = async (data, { user }) => {
	console.log(data)
}

module.exports = {
	profile,
	getUser,
	getUsers,

	updateUser,
}
