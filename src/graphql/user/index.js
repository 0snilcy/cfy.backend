const { GraphQLString, GraphQLObjectType, GraphQLBoolean } = require('graphql')
const UserModelType = require('./model')
const User = require('../../db/models/user')

const tokenService = require('../../services/token.service')

const UserType = new GraphQLObjectType({
	name: 'UserQueryType',
	fields: {
		me: {
			type: UserModelType,
			resolve(user, args, req, info) {
				console.log(user)

				return user
			},
		},
	},
})

const query = {
	name: 'UserQuery',
	type: UserType,
	async resolve(_, __, req) {
		const { admin } = req.cookies
		if (admin && admin === process.env.ADMIN) {
			const user = await User.findById(process.env.ADMIN_ID)
			if (user) {
				// todo: mb used style with user in req?
				// req.user = user
				return user
			}
		}

		const header = req.headers.Authorization || req.headers.authorization
		if (header) {
			const [type, token] = header.split(' ')
			if (type === 'Bearer' && token) {
				const session = tokenService.verify(token)
				if (session) {
					const userId = await tokenService.getUserId(session)

					try {
						const user = await User.findById(userId)

						if (!user) {
							return new Error('Invalid token')
						}

						return user.getPublicFields()
					} catch (err) {
						return new Error(err.message)
					}
				}
			}
		}

		throw new Error('Invalid authentication')
	},
}

module.exports = {
	query,
}
