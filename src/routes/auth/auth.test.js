const { connect, clear, close } = require('../../../tests/mongo.service')

const path = require('path')
const env = path.resolve(
	__dirname,
	'../../../env/',
	'.env.' + process.env.NODE_ENV
)

require('dotenv').config({
	path: env,
})

const { SECRET } = process.env
const jwt = require('jsonwebtoken')

beforeAll(connect)
beforeEach(clear)
afterAll(close)

const request = require('supertest')
const { User } = require('../../db/models')

const { app } = require('../../server')

const user = {
	email: 'test@test.com',
	password: 'test12345',
}

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
		const res = await request(app)
			.post('/auth/signup')
			.send(user)

		const { token } = res.body
		const id = jwt.verify(token, SECRET)

		const dbuser = await User.findById(id)
		expect(res.statusCode).toBe(200)
		expect(dbuser.email).toBe(user.email)
	})

	test('Invalid signup with empty user', async () => {
		const res = await request(app)
			.post('/auth/signup')
			.send({})

		expect(res.statusCode).toBe(401)
	})

	test('Dublicate signup', async () => {
		expect.assertions(2)

		const res = await request(app)
			.post('/auth/signup')
			.send(user)
		expect(res.statusCode).toBe(200)

		const secondRes = await request(app)
			.post('/auth/signup')
			.send(user)
		expect(secondRes.statusCode).toBe(409)
	})
})

describe('Sign In', () => {
	test('Invalid signin with empty user', async () => {
		const res = await request(app)
			.post('/auth/signin')
			.send(user)

		expect(res.statusCode).toBe(401)
	})

	test('Valid signin', async () => {
		const dbuser = await User.create(user)
		const token = jwt.sign(dbuser.id, SECRET)

		const res = await request(app)
			.post('/auth/signin')
			.send(user)

		const serverToken = res.body.token
		expect(serverToken).toBe(token)
		expect(res.statusCode).toBe(200)
	})

	test('Valid Authorization via token', async () => {
		const dbuser = await User.create(user)
		const token = jwt.sign(dbuser.id, SECRET)

		const res = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + token)

		const serverUser = res.body.user
		expect(res.statusCode).toBe(200)
		expect(serverUser.email).toBe(user.email)
	})

	test('Invalid Authorization with empty header', async () => {
		const res = await request(app).get('/profile')

		expect(res.statusCode).toBe(401)
	})

	test('Invalid Authorization via invalid token', async () => {
		const token = 'test'

		const res = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + token)

		expect(res.statusCode).toBe(401)
	})
})
