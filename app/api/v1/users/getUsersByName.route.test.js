const chakram = require('chakram')
const expect = chakram.expect
const nock = require('nock')
const mockRequire = require('mock-require')
const clientsUri = require(`${process.env.PWD}/externalServices.js`).clients
const getHost = require(`${process.env.PWD}/helperFunctions/getHost.js`)
const getRoute = require(`${process.env.PWD}/helperFunctions/getRoute.js`)

const url = `${process.env.WEB_DOMAIN}/api/v1/users?name=`

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

const client = clients[1]

describe('GET v1/users?name=:name', () => {

  before(() => {		
		mockRequire(`${process.env.PWD}/logger.js`, {
			info: (message) => {},
			error: (message) => {}
		})
		require(`${process.env.PWD}/server.js`)
	})

	after(() => mockRequire.stop(`${process.env.PWD}/logger.js`))

	beforeEach(() =>
		!process.env.ITEST && nock(getHost(clientsUri), { allowUnmocked: true })
		.get(getRoute(clientsUri))
		.reply(200, { clients })
	)

	afterEach(() => nock.cleanAll())

  it("Get user data filtered by user name",	() =>
		chakram.get(`${url}${client.name}`)
		.then(response => {
			expect(response).to.have.status(200)
			expect(response).to.comprise.of.json({
				clients: {
					items: [
						client
          ]
				}
			})  
		})
	)

	it("Get an empty result if there is not an user with the name", () =>
		chakram.get(`${url}xxx`)
		.then(response => {
			expect(response).to.have.status(200)
			expect(response).to.comprise.of.json({
				clients: {
					items: []
				}
			})  
		})
	)

	it("Get an empty result if the name param is empty", () =>
		chakram.get(`${url}`)
		.then(response => {
			expect(response).to.have.status(200)
			expect(response).to.comprise.of.json({
				clients: {
					items: []
				}
			})  
		})
	)

	it("Error 500 if the clients service is down", () => {

		nock.cleanAll()

		nock(getHost(clientsUri), { allowUnmocked: true })
		.get(getRoute(clientsUri))
		.reply(500)

		return chakram.get(`${url}xxx`)
		.then(response => {
			expect(response).to.have.status(500)
		})

	})

})
