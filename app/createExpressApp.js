const express = require('express')
const bodyParser = require('body-parser')
const winston = require(`${__root_dirname}/logger`)
const expressWinston = require('express-winston')
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const createApiRouter = require('./api/createApiRouter.js')

module.exports = express()
.use(expressWinston.logger({
	winstonInstance: winston,
  msg: "{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms",
	meta: false
}))
.use(bodyParser.json())
.use(bodyParser.urlencoded({ extended: true }))
.use('/api/docs', swaggerUi.serve, swaggerUi.setup(
	swaggerJSDoc({
		swaggerDefinition: {
			info: {
				title: 'Api Documentation',
				version: '1.0.0'
			},
			basePath: '/api' 
		},  
			apis: ['./app/api/**/*.js']
	}),
  true
))
.use((req, res, next) => {
	req.domain = `${req.protocol}://${req.get('host')}`
	return next()
})
.use('/api', createApiRouter())
.use((req, res, next) => res.sendStatus(404))
.use((error, req, res, next) => {
	winston.error(error, error)
	res.sendStatus(error.status || 500)
})
