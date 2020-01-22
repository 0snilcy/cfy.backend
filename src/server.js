const { SERVER_PORT } = process.env

const express = require('express')
const app = express()

const logger = require('debug')('components:server:')
const morgan = require('morgan')
app.use(morgan('dev'))

// const bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())
app.use(express.json())

const routes = require('./routes')
app.use(routes)

const start = () => {
	app.listen(SERVER_PORT, () =>
		logger(`Server listening on port ${SERVER_PORT}`)
	)
}

module.exports = {
	start,
	app,
}

// const coockieParser = require('cookie-parser')
// const redisClient = require('redis').createClient()
// const session = require('express-session')
// const redisStore = require('connect-redis')(session)
// const uuid = require('uuid/v4')
// app.use(
// 	session({
// 		genid: () => uuid(),
// 		secret: SECRET,
// 		store: new redisStore({
// 			host: 'localhost',
// 			port: 6379,
// 			client: redisClient,
// 		}),
// 		resave: false,
// 		saveUninitialized: false,
// 		cookie: {
// 			secure: false,
// 		},
// 	})
// )

// app.use(coockieParser())
// redisClient.on('error', err => {
// 	logger('Redis error: ', err)
// })

// redisClient.on('ready', () => {
// 	logger('Successfully connected to redis')
// })
