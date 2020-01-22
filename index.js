require('module-alias/register')
const path = require('path')

require('dotenv').config({
	path: path.resolve(__dirname, './env/', '.env.' + process.env.NODE_ENV),
})
