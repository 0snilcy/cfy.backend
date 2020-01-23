const { SERVER_PORT } = process.env

const express = require('express')
const app = express()
const { connection } = require('./db/index')

const logger = require('debug')('components:server:')
const morgan = require('morgan')
app.use(morgan('dev'))

app.use(express.json())

const routes = require('./routes')
app.use(routes)

const start = async () => {
	await connection.connect()

	app.listen(SERVER_PORT, () =>
		logger(`Server listening on port ${SERVER_PORT}`)
	)
}

module.exports = {
	start,
	app,
}
