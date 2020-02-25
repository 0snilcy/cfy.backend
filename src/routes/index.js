const { Router } = require('express')

const graphqlHTTP = require('express-graphql')
// const { GraphQLSchema } = require('graphql')

const schema = require('../graphql/schema')

const mainRouter = Router()

mainRouter.use(
	'/api',
	graphqlHTTP({
		schema,
		graphiql: true,
	})
)

mainRouter.use((req, res) => {
	res.status(404).send({
		message: 'Not found',
	})
})

module.exports = mainRouter
