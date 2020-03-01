const jwt = require('jsonwebtoken')
const redis = require('redis')
const logger = require('debug')('service:token:')
const { SECRET } = process.env
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
const uuid = require('uuid/v4')

const defaultJwtConfig = {
	expiresIn: '20m',
}

class TokenService {
	constructor() {
		this.redisClient = redis.createClient()
		this.redisClient.on('connect', () => logger('Redis connect'))
		this.redisClient.on('error', () => logger('Redis error'))
	}

	async createToken(userId, config = defaultJwtConfig) {
		const sid = uuid()
		await this.redisClient.setAsync(sid, userId)
		return jwt.sign({ sid }, SECRET, config)
	}

	async updateToken(token) {
		const payload = this.decode(token)
		const userId = await this.getUserId(payload)
		await this.redisClient.delAsync(payload.sid)

		if (userId) {
			return this.createToken(userId)
		}
	}

	decode(token) {
		return jwt.decode(token, SECRET)
	}

	verify(token) {
		return jwt.verify(token, SECRET)
	}

	async getUserId({ sid }) {
		return this.redisClient.getAsync(sid)
	}
}

module.exports = new TokenService()
