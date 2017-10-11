const httpClient = require('request-promise')
const logger = require(`${__root_dirname}/logger.js`) 
const clientsUri = require(`${__root_dirname}/externalServices.js`).clients

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     tags: 
 *     - users
 *     summary: Find user by id
 *     description: Get user data filtered by user id. Can be accessed by users with role "users" and "admin"
 *     operationId: getUserById
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Id of the user to return
 *         required: true
 *         type: string
 *         example: "a3b8d425-2b60-4ad7-becc-bedf2ef860bd"
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           required:
 *           - "id"
 *           - "name"
 *           - "email"
 *           - "role"
 *           properties:
 *             id:
 *               type: "string"
 *               example: "a0ece5db-cd14-4f21-812f-966633e7be86"
 *             name:
 *               type: "string"
 *               example: "Britney"
 *             email:
 *               type: "string"
 *               example: "britneyblankenship@quotezart.com"
 *               format: "email"
 *             role:
 *               type: "string"
 *               enum:
 *                 - "admin"
 *                 - "user"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
module.exports = require('express')
.Router({mergeParams: true})
.get('/v1/users/:id', (req, res, next) => {
	httpClient({
		uri: clientsUri,
		json: true
	})
	.then(response => response.clients.find(client => client.id == req.params.id))
	.then(client => client ? res.send(client) : res.sendStatus(404))
	.catch(error => {
		logger.error(error)
		res.sendStatus(500)
	})
})
