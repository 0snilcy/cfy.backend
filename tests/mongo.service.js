const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()

const connect = async () => {
	try {
		const uri = await mongod.getConnectionString()
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		})
	} catch (err) {
		console.log(err)
	}
}

const clear = async () => {
	const { collections } = mongoose.connection

	for (const key in collections) {
		if (collections.hasOwnProperty(key)) {
			const collection = collections[key]
			await collection.deleteMany()
		}
	}
}

const close = async () => {
	await mongoose.connection.dropDatabase()
	await mongoose.connection.close()
	await mongod.stop()
}

module.exports = {
	connect,
	clear,
	close,
}
