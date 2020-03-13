const { connect, clear, close } = require('../../../tests/mongo.service')

require('dotenv').config({
	path: 'env/.env.test',
})

const User = require('../../db/models/user')
const tokenService = require('../../services/token.service')

const { graphql } = require('graphql')
const schema = require('../')
const { CODE } = require('../error')

const createUserMutation = `
	mutation SignUp($email: String! $password: String!) {
		auth {
			create(
				email: $email
				password: $password
				) {
					token
					name
					email
				}
			}
		}`

const loginUserMutation = `
	mutation SignIn($email: String! $password: String!) {
		auth {
			login(
				email: $email
				password: $password
				) {
					token
					name
					email
					id
				}
			}
		}`

const getUserQuery = `
	query GetUser {
		user {
			me {
				name
				email
				id
				}
			}
		}`

const user = {
	email: 'test@corp.com',
	password: 'test',
	name: 'Test user',
}

const createdUser = {
	email: 'test@create.com',
	password: 'test',
	name: 'Created test user',
}

const reqCreate = () => graphql(schema, createUserMutation, null, null, user)
const reqLogin = () =>
	graphql(schema, loginUserMutation, null, null, createdUser)
const getErrMessage = response => response.errors[0].message

beforeAll(connect)
beforeEach(async () => {
	await graphql(schema, createUserMutation, null, null, createdUser)
})
afterEach(clear)
afterAll(close)

describe('Sign Up', () => {
	test('Create user without email', async () => {
		expect.assertions(1)
		try {
			await User.create({ password: user.password })
		} catch (err) {
			expect(err.message).toMatch('User validation failed')
		}
	})

	test('Valid signup', async () => {
		const response = await reqCreate()
		expect(response.data.auth.create.token).toBeDefined()
	})

	test('Invalid signup with empty user', async () => {
		const response = await graphql(schema, createUserMutation, null, null, {
			password: 'test',
		})
		expect(getErrMessage(response)).toMatch(/\$email/)
	})

	test('Duplicate create user error', async () => {
		await reqCreate()
		const response = await reqCreate()

		expect(getErrMessage(response)).toMatch(/User alrady exist/)
	})
})

describe('Sign In', () => {
	test('Invalid signin with empty user', async () => {
		const response = await graphql(schema, loginUserMutation, null, null, {
			password: 'test',
		})
		expect(getErrMessage(response)).toMatch(/\$email/)
	})

	test('Valid signin', async () => {
		const response = await reqLogin()
		expect(response.data.auth.login.email).toBe(createdUser.email)
	})

	test('Valid authentication', async () => {
		const { data } = await reqLogin()
		const token = data.auth.login.token
		const response = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		})

		expect(response.data.user.me.email).toBe(createdUser.email)
	})

	test('Invalid authentication', async () => {
		await reqLogin()
		const response = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: 'Bearer',
				},
			},
		})

		expect(response.errors[0].extensions.code).toBe('UNAUTHENTICATED')
	})

	test('Get new valid token after expired', async () => {
		const { data } = await reqLogin()
		const token = await tokenService.createToken(data.auth.login.id, {
			expiresIn: '0s',
		})
		const response = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		})

		expect(response.errors[0].extensions.code).toBe(CODE.EXPIRED_TOKEN)
		expect(response.errors[0].extensions.token).toBeDefined()

		const newToken = response.errors[0].extensions.token
		const updateResponse = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: `Bearer ${newToken}`,
				},
			},
		})

		expect(updateResponse.data.user.me.email).toBe(createdUser.email)
	})

	test('Invalid token after update', async () => {
		const { data } = await reqLogin()
		const token = await tokenService.createToken(data.auth.login.id, {
			expiresIn: '0s',
		})
		const response = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		})

		expect(response.errors[0].extensions.code).toBe(CODE.EXPIRED_TOKEN)
		expect(response.errors[0].extensions.token).toBeDefined()

		const newResponse = await graphql(schema, getUserQuery, null, {
			req: {
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		})

		expect(newResponse.errors[0].extensions.code).toBe('UNAUTHENTICATED')
	})
})
