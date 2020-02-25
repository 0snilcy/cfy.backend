const {
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
	GraphQLInputObjectType,
} = require('graphql')
const { UserType } = require('./user')

const RootQuery = new GraphQLObjectType({
	name: 'RootQuery',
	fields: {
		user: {
			type: GraphQLString,
			resolve() {
				return '123'
			},
		},
	},
})

const LoginInputType = new GraphQLInputObjectType({
	name: 'LoginInputType',
	fields: {
		email: { type: GraphQLString },
		password: { type: GraphQLString },
	},
})

const GuestType = new GraphQLObjectType({
	name: 'GuestType',
	fields: {
		login: {
			name: 'Login for guest',
			type: UserType,
			args: {
				data: { type: LoginInputType },
			},
			resolve(parent, { data }, req, info) {
				return {
					email: data.email,
				}
			},
		},
	},
})

const RootMutation = new GraphQLObjectType({
	name: 'RootMutation',
	fields: {
		guest: {
			type: GuestType,
			description: 'Guest Mutation',
			resolve() {
				return true
			},
		},
	},
})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation,
})
