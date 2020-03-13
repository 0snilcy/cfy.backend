const { GraphQLObjectType, GraphQLSchema } = require('graphql')

const user = require('./user')
const auth = require('./auth')

const RootQuery = new GraphQLObjectType({
	name: 'RootQuery',
	fields: {
		user: user.query,
	},
})

const RootMutation = new GraphQLObjectType({
	name: 'RootMutation',
	fields: {
		auth: auth.mutation,
		user: user.mutation,
	},
})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation,
})
