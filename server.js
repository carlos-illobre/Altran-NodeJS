global.__root_dirname = __dirname

const logger = require('./logger')
const port = process.env.PORT || 8080

module.exports = require('http')
.createServer(require('./app/createExpressApp.js'))
.listen(port)
.on('listening', function() {
	const addr = this.address()
	const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
	logger.info(`Listening on ${bind}`)
})
.on('error', function(error) {
	if (error.syscall !== 'listen') throw error
	const addr = this.address() || { port: port	}
	const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
	switch (error.code) {
		case 'EACCES':
			logger.error(`${bind} requires elevated privileges`, error)
			process.exit(1)
			break
		case 'EADDRINUSE':
			logger.error(`${bind} is already in use`, error)
			process.exit(1)
			break
		default:
			throw error
	}
})
