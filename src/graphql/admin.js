const logger = require('debug')('components:graphql:guest ')

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLList,
} = require('graphql')
const { UserType } = require('./user')

const User = require('../db/models/user')
const tokenService = require('../services/token.service')

const AdminUserInput = new GraphQLInputObjectType({
	name: 'AdminUserInput',
	fields: {
		id: { type: GraphQLString },
		email: { type: GraphQLString },
		name: { type: GraphQLString },
	},
})

const AdminType = new GraphQLObjectType({
	name: 'AdminType',
	fields: {
		profile: {
			description: 'Authorization of an existing user',
			type: new GraphQLList(UserType),
			args: {
				data: { type: AdminUserInput },
			},
			async resolve(parent, { data }, req, info) {
				const { id, email, name } = data

				try {
					if (id) {
						const user = await User.findById(id)
						return [user]
					}

					if (email) {
						const user = await User.findOne({ email })
						return [user]
					}

					const user = await User.find({ name })
					return user
				} catch (err) {
					throw new Error(err.message)
				}
			},
		},
		create: {
			description: 'Create a new user',
			type: UserType,
			args: {
				data: { type: AdminUserInput },
			},
			async resolve(parent, { args: fields }, req, info) {
				const { email, password } = fields
				logger('Login ', email, password)

				if (!email || !password) {
					throw new Error('Invalid data')
				}

				try {
					const user = await User.findOne({ email })
					if (user) {
						throw new Error('User alrady exist')
					}
				} catch (err) {
					throw new Error(err.message)
				}

				const user = await User.create(fields)

				return {
					...user.getPublicFields(),
					token: await tokenService.createToken(user.id),
				}
			},
		},
	},
})

const admin = {
	type: AdminType,
	description: 'Admin Query',
	resolve(parent, args, req, info) {
		console.log(parent)
		console.log(args)
		console.log(req.headers)

		return true
	},
}

module.exports = {
	admin,
}
