const logger = require('debug')('components:graphql:user ')

const { GraphQLObjectType, GraphQLBoolean } = require('graphql')
const UserModelType = require('./model')
const isAuthResolver = require('./isauth')
const tokenService = require('../../services/token.service')

const UserType = new GraphQLObjectType({
	name: 'UserQueryType',
	fields: {
		me: {
			type: UserModelType,
			resolve(user) {
				return user
			},
		},
	},
})

const query = {
	name: 'UserQuery',
	type: UserType,
	resolve: isAuthResolver,
}

const UserMutation = new GraphQLObjectType({
	name: 'UserMutation',
	fields: {
		logout: {
			type: GraphQLBoolean,
			async resolve(user, __, { req }) {
				if (req.token) {
					logger('Logout ', user.email)

					await tokenService.removeToken(req.token)
					return true
				}
			},
		},
	},
})

const mutation = {
	name: 'UserMutation',
	type: UserMutation,
	resolve: isAuthResolver,
}

module.exports = {
	query,
	mutation,
}
