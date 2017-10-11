const httpClient = require('request-promise')
const logger = require(`${__root_dirname}/logger.js`)
const policiesUri = require(`${process.env.PWD}/externalServices.js`).policies
const isAdmin = require(`${__root_dirname}/helperFunctions/isAdmin.js`)

/**
 * @swagger
 * /v1/policies?username=username:
 *   get:
 *     tags: 
 *     - policies
 *     summary: Get the list of policies linked to a user name
 *     description: Get the list of policies linked to a user name -> Can be accessed by users with role "admin"
 *     operationId: getPolicies
 *     produces:
 *     - application/json
 *     parameters:
 *     - name: userid
 *       in: header
 *       description: User's id.
 *       required: true
 *       type: string
 *       example: "a0ece5db-cd14-4f21-812f-966633e7be86"
 *     - name: username
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
 *             policies:
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
 *                     - amountInsured
 *                     - email
 *                     - inceptionDate
 *                     - installmentPayment
 *                     - clientId
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 64cceef9-3a01-49ae-a23b-3761b604800b
 *                       amountInsured:
 *                         type: number
 *                         example: 1825.89
 *                       email:
 *                         type: string
 *                         example: inesblankenship@quotezart.com
 *                         format: email
 *                       inceptionDate:
 *                         type: string
 *                         example: 2014-12-01T05:53:13Z
 *                         format: date-time
 *                       installmentPayment:
 *                         type: boolean
 *                         example: true
 *                       clientId:
 *                         type: string
 *                         example: e8fd159b-57c4-4d36-9bd7-a59ca13057bb
 *       401:
 *         description: Unauthorized, the user is not admin
 *       500:
 *         description: Internal server error
 */
module.exports = require('express')
.Router({mergeParams: true})
.get('/v1/policies', (req, res, next) => {
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
			uri: `${req.domain}/api/v1/users?name=${req.query.username}`,
			json: true
		})
	})
	.then(response => Promise.all([
		response.clients.items.map(client => client.id),
		httpClient({
			uri: policiesUri,
			json: true
		})
	]))
	.then(([clientsIds, response]) => response.policies.filter(policy => clientsIds.indexOf(policy.clientId) != -1))
	.then(policies => res.send({
		policies: {
			items: policies
		}
	}))
	.catch(error => {
		if (error.statusCode == 500) logger.error(error)
		res.sendStatus(error.statusCode)
	})
})
