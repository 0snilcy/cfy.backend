const jwt = require('jsonwebtoken')
const redis = require('redis')
const logger = require('debug')('service:token:')
const { SECRET } = process.env
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
const uuid = require('uuid/v4')
const expiresIn = process.env.TOKEN_EXPIRED

const defaultJwtConfig = {
	expiresIn,
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

		if (userId) {
			await this.redisClient.delAsync(payload.sid)
			return this.createToken(userId)
		}
	}

	async removeToken(token) {
		const { sid } = this.decode(token)
		await this.redisClient.delAsync(sid)
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
