const mongoose = require('mongoose')
const { DB_URL, NODE_ENV } = process.env
const logger = require('debug')('components:db:')

const connect = async () => {
	if (NODE_ENV !== 'test') {
		try {
			await mongoose.connect(DB_URL, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
			})

			mongoose.connection.on('connected', () =>
				logger('Mongoose default connection open to ' + DB_URL)
			)
		} catch (err) {
			logger(err.message)
			process.exit(1)
		}
	}
}

module.exports = {
	connect,
}
