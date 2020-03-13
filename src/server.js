const { SERVER_PORT } = process.env

const express = require('express')
const app = express()
const { connect } = require('./db/connection')
const routes = require('./routes')

const logger = require('debug')('components:server:')
const morgan = require('morgan')

app.use(morgan('dev'))
app.use(routes)

const start = async () => {
	try {
		await connect()
	} catch (err) {
		console.log(err.message)
	}

	app.listen(SERVER_PORT, () =>
		logger(`Server listening on port ${SERVER_PORT}`)
	)
}

module.exports = {
	start,
	app,
}
