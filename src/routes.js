const isDev = process.env.NODE_ENV === 'development'

const { express: voyager } = require('graphql-voyager/middleware')

const { ApolloServer } = require('apollo-server-express')
const schema = require('./graphql')
const router = require('express').Router()

const API_ENDPOINT = '/api'

const apollo = new ApolloServer({
	schema,
	playground: isDev,
	context: ({ req }) => ({ req }),
})

apollo.applyMiddleware({
	app: router,
	path: API_ENDPOINT,
})

if (isDev) {
	router.use('/voyager', voyager({ endpointUrl: API_ENDPOINT }))
}

router.use((err, req, res, _next) => {
	return res.send(err)
})

router.use((req, res) =>
	res.status(404).send({
		message: 'Not found',
	})
)

module.exports = router
