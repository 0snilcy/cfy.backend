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

const { tokenService } = require('../../services/token.service')

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
		const payload = tokenService.verify(token)
		const userId = await tokenService.getUserId(payload)
		const dbuser = await User.findById(userId)

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

		const res = await request(app)
			.post('/auth/signin')
			.send(user)

		const token = res.body.token
		const payload = tokenService.verify(token)
		const userId = await tokenService.getUserId(payload)

		expect(res.statusCode).toBe(200)
		expect(dbuser.id).toBe(userId)
	})

	test('Valid Authorization via token', async () => {
		const dbuser = await User.create(user)
		const token = await tokenService.createToken(dbuser.id)

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

	test('Get new Authorization via expired token', async () => {
		const dbuser = await User.create(user)
		const token = await tokenService.createToken(dbuser.id, {
			expiresIn: '0s',
		})

		const res = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + token)

		expect(res.statusCode).toBe(401)
		expect(res.body.token).toBeDefined()

		const newRes = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + res.body.token)

		expect(newRes.statusCode).toBe(200)
		expect(newRes.body.user.email).toBe(user.email)
	})

	test('Invalid token after update', async () => {
		const dbuser = await User.create(user)
		const token = await tokenService.createToken(dbuser.id, {
			expiresIn: '0s',
		})

		const res = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + token)

		await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + res.body.token)

		const otherRes = await request(app)
			.get('/profile')
			.set('Authorization', 'Bearer ' + token)

		expect(otherRes.statusCode).toBe(401)
		expect(otherRes.body.token).toBeUndefined()
	})
})
