const { GraphQLObjectType, GraphQLSchema } = require('graphql')
const { userType } = require('./user')

const AuthMutationType = new GraphQLObjectType({
	name: 'AuthMutation',
	description: 'AuthMutation Type',
	fields: () => ({
		login: {
			type: userType,
			resolve: (...args) => {
				console.log(args)
			},
		},
	}),
})

const queryType = new GraphQLObjectType({
	name: 'Query',
})

module.exports = new GraphQLSchema({
	mutation: AuthMutationType,
	query: queryType,
})
