const path = require('path')

require('dotenv').config({
	path: path.resolve(__dirname, './env/', '.env.' + process.env.NODE_ENV),
})

require('./src/server').start()
