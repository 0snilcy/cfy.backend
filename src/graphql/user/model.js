const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLNonNull,
} = require('graphql')

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: GraphQLString },
		email: { type: new GraphQLNonNull(GraphQLString) },
		password: { type: GraphQLString },
	},
})

module.exports = UserType
