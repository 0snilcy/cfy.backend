const { Router } = require('express')
const graphqlHTTP = require('express-graphql')
const isAuthMW = require('../middlewares/isauth.mw')

const authSchema = require('../graphql/auth')
const apiSchema = require('../graphql/api')

const mainRouter = Router()
const isDev = process.env.NODE_ENV === 'development'

mainRouter.use(
	'/api',
	graphqlHTTP({
		schema: apiSchema,
		graphiql: isDev,
	})
)

mainRouter.use((err, req, res, _next) => {
	return res.send(err)
})

mainRouter.use((req, res) =>
	res.status(404).send({
		message: 'Not found',
	})
)

module.exports = mainRouter
