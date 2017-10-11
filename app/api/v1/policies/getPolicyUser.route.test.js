const chakram = require('chakram')
const expect = chakram.expect
const nock = require('nock')
const mockRequire = require('mock-require')
const clientsUri = require(`${process.env.PWD}/externalServices.js`).clients
const policiesUri = require(`${process.env.PWD}/externalServices.js`).policies
const getHost = require(`${process.env.PWD}/helperFunctions/getHost.js`)
const getRoute = require(`${process.env.PWD}/helperFunctions/getRoute.js`)
const isAdmin = require(`${process.env.PWD}/helperFunctions/isAdmin.js`)

const clients = [
	{  
		id: "a0ece5db-cd14-4f21-812f-966633e7be86",
		name: "Britney",
		email: "britneyblankenship@quotezart.com",
		role: "admin"
	},{  
		id: "e8fd159b-57c4-4d36-9bd7-a59ca13057bb",
		name: "Manning",
		email: "manningblankenship@quotezart.com",
		role: "admin"
	},{  
		id: "a3b8d425-2b60-4ad7-becc-bedf2ef860bd",
		name: "Barnett",
		email: "barnettblankenship@quotezart.com",
		role: "user"
	}
]

const policies = [  
	{  
		 id: '64cceef9-3a01-49ae-a23b-3761b604800b',
		 amountInsured: 1825.89,
		 email: 'inesblankenship@quotezart.com',
		 inceptionDate: '2016-06-01T03:33:32Z',
		 installmentPayment: true,
		 clientId: 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'
	},{  
		 id: '7b624ed3-00d5-4c1b-9ab8-c265067ef58b',
		 amountInsured: 399.89,
		 email: 'inesblankenship@quotezart.com',
		 inceptionDate: '2015-07-06T06:55:49Z',
		 installmentPayment: true,
		 clientId: 'a0ece5db-cd14-4f21-812f-966633e7be86'
	},{  
		 id: '56b415d6-53ee-4481-994f-4bffa47b5239',
		 amountInsured: 2301.98,
		 email: 'inesblankenship@quotezart.com',
		 inceptionDate: '2014-12-01T05:53:13Z',
		 installmentPayment: false,
		 clientId: 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'
	}
]

const admin = clients.find(isAdmin)
const user = clients.find(client => !isAdmin(client))
const policy = policies[0]
const client = clients.find(client => client.id == policy.clientId)

const url = `${process.env.WEB_DOMAIN}/api/v1/policies/${policy.id}/user`

describe('GET v1/policies/:id/user', () => {

  before(() => {		
		mockRequire(`${process.env.PWD}/logger.js`, {
			info: (message) => {},
			error: (message) => {}
		})
		require(`${process.env.PWD}/server.js`)
	})

	after(() => mockRequire.stop(`${process.env.PWD}/logger.js`))

	beforeEach(() => {
		if (!process.env.ITEST) {
			nock(getHost(clientsUri), { allowUnmocked: true })
			.get(getRoute(clientsUri))
			.twice()
			.reply(200, { clients })

			nock(getHost(policiesUri), { allowUnmocked: true })
			.get(getRoute(policiesUri))
			.reply(200, { policies })
		}
	})

	afterEach(() => nock.cleanAll())

  it("Get the user linked to a policy number if the user is admin",	() =>
		chakram.get(url, {
			headers: {
				userId: admin.id
			}
		})
		.then(response => {
			expect(response).to.have.status(200)
			expect(response).to.comprise.of.json(client)
		})
	)

	it("Error 401 if the user's role is not admin", () =>
		chakram.get(url, {
			headers: {
				userId: user.id
			}   
		})
		.then(response => {
			expect(response).to.have.status(401)
		})
	)

	it("Error 401 if the userId header is not set", () =>
		chakram.get(url)
		.then(response => {
			expect(response).to.have.status(401)
		})
	)

	it("Error 401 if the userId header is invalid", () =>
		chakram.get(url, {
			headers: {
				userId: 'xxxx'
			}   
		})
		.then(response => {
			expect(response).to.have.status(401)
		})
	)

	it("Error 404 if the policy does not exist", () =>
		chakram.get(url.replace(policy.id, 'xxx'), {
			headers: {
				userId: admin.id
			}   
		})
		.then(response => {
			expect(response).to.have.status(404)
		})
	)

	it("Error 500 if the policies service is down", () => {

		nock.cleanAll()

		nock(getHost(clientsUri), { allowUnmocked: true })
		.get(getRoute(clientsUri))
		.reply(200, { clients })

		nock(getHost(policiesUri), { allowUnmocked: true })
		.get(getRoute(policiesUri))
		.reply(500, { policies })

		return chakram.get(url, {
			headers: {
				userId: admin.id
			}
		})
		.then(response => {
			expect(response).to.have.status(500)
		})

	})

})
