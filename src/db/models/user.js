const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const logger = require('debug')('components:mongoose:')

const schema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		min: 6,
	},
})

schema.pre('save', async function(next) {
	const user = this

	if (this.isModified('password') || this.isNew) {
		try {
			const salt = await bcrypt.genSalt(7)
			const password = await bcrypt.hash(user.password, salt)
			user.password = password
		} catch (err) {
			logger(err)
		}
	}

	next()
})

schema.methods.comparePassword = async function(password) {
	try {
		return await bcrypt.compare(password.toString(), this.password)
	} catch (err) {
		return err
	}
}

schema.methods.getPublicFields = function() {
	return {
		email: this.email,
		id: this.id,
	}
}

const User = mongoose.model('User', schema)

module.exports = User
