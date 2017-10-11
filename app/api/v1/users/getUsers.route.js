const httpClient = require('request-promise')
const logger = require(`${__root_dirname}/logger.js`) 
const clientsUri = require(`${__root_dirname}/externalServices.js`).clients

/**
 * @swagger
 * /v1/users?name=name:
 *   get:
 *     tags: 
 *     - users
 *     summary: Find users by name
 *     description: Get user data filtered by user name -> Can be accessed by users with role "users" and "admin"
 *     operationId: getUsersByName
 *     produces:
 *     - application/json
 *     parameters:
 *     - name: name
 *       in: query
 *       description: User's name.
 *       required: true
 *       type: string
 *       example: Britney
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           required:
 *           - items
 *           properties:
 *             clients:
 *               type: object
 *               required:
 *               - items
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                     - id
 *                     - name
 *                     - email
 *                     - role
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: a0ece5db-cd14-4f21-812f-966633e7be86
 *                       name:
 *                         type: string
 *                         example: Britney
 *                       email:
 *                         type: string
 *                         example: britneyblankenship@quotezart.com
 *                         format: email
 *                       role:
 *                         type: string
 *                         enum:
 *                         - admin
 *                         - user
 *       500:
 *         description: Internal server error
 */
module.exports = require('express')
.Router({mergeParams: true})
.get('/v1/users', (req, res, next) => {
	httpClient({
		uri: clientsUri,
		json: true
	})
	.then(response => response.clients.filter(client =>
		client.name == req.query.name
	))
	.then(clients => res.send({
		clients: {
			items: clients
		}
	}))
	.catch(err => {
		logger.error(err)
		res.sendStatus(500)
	})
})
