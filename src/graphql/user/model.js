const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLNonNull,
	GraphQLBoolean,
} = require('graphql')

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: GraphQLString },
		email: { type: new GraphQLNonNull(GraphQLString) },
		password: { type: GraphQLString },
		token: { type: GraphQLString },
		isAdmin: { type: GraphQLBoolean, defaultValue: false },
	},
})

module.exports = UserType
