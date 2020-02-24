const { isAuth } = require('./auth')

const graphqlHTTP = require('express-graphql')
const { importSchema } = require('graphql-import')
const { buildSchema } = require('graphql')
const apiResolvers = require('../graphql/resolvers')
const authResolvers = require('../graphql/resolvers/auth')

const setRouters = async mainRouter => {
	mainRouter.get('/', (req, res) => {
		res.send('Hello, world!')
	})

	const authSchema = await importSchema('src/graphql/auth.gql')
	const apiSchema = await importSchema('src/graphql/api.gql')

	mainRouter.use(
		'/auth',
		graphqlHTTP({
			schema: buildSchema(authSchema),
			rootValue: authResolvers,
			graphiql: true,
		})
	)

	mainRouter.use(isAuth)

	mainRouter.use(
		'/api',
		graphqlHTTP({
			schema: buildSchema(apiSchema),
			rootValue: apiResolvers,
			graphiql: true,
		})
	)

	mainRouter.use((req, res) => {
		res.status(404).send({
			message: 'Not found',
		})
	})
}

module.exports = setRouters
