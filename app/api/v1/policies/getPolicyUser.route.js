const httpClient = require('request-promise')
const logger = require(`${__root_dirname}/logger.js`)
const policiesUri = require(`${process.env.PWD}/externalServices.js`).policies
const isAdmin = require(`${__root_dirname}/helperFunctions/isAdmin.js`)

/**
 * @swagger
 * /v1/policies/{id}/user:
 *   get:
 *     tags: 
 *     - policies
 *     summary: Get the user linked to a policy number
 *     description: Get the user linked to a policy number -> Can be accessed by users with role "admin"
 *     operationId: getPolicyUser
 *     produces:
 *     - application/json
 *     parameters:
 *     - name: id
 *       in: path
 *       description: Id of the policy
 *       required: true
 *       type: string
 *       example: "64cceef9-3a01-49ae-a23b-3761b604800b"
 *     - name: userid
 *       in: header
 *       description: User's id.
 *       required: true
 *       type: string
 *       example: "a0ece5db-cd14-4f21-812f-966633e7be86"
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
 *       401:
 *         description: Unauthorized, the user is not admin
 *       500:
 *         description: Internal server error
 */
module.exports = require('express')
.Router({mergeParams: true})
.get('/v1/policies/:id/user', (req, res, next) => {
	Promise.resolve(req.get('userId'))
	.then(userId => {
		if (!userId) throw { statusCode: 401 }
		return httpClient({
			uri: `${req.domain}/api/v1/users/${req.get('userId')}`,
			json: true
		})
 		.catch(error => {
			throw { statusCode: 401 }
		})
	})
	.then(user => {
		if (!isAdmin(user)) throw { statusCode: 401 }
		return httpClient({
			uri: policiesUri,
			json: true
		})
	})
	.then(response => response.policies.find(policy => policy.id == req.params.id))
	.then(policy => {
		if (!policy) throw { statusCode: 404 }
		return httpClient({
			uri: `${req.domain}/api/v1/users/${policy.clientId}`,
			json: true
		})
	})
	.then(client => res.send(client))
	.catch(error => {
		if (error.statusCode == 500) logger.error(error)
		res.sendStatus(error.statusCode)
	})
})
