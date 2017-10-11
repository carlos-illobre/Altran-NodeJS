const expect = require('chai').expect
const getRoute = require('./getRoute.js')

describe('getRoute()', () => {

	it("Return the route form a url", () => {
		expect(getRoute('http://www.mocky.io/v2/5808862710000087232b75ac'))
		.to.equal('/v2/5808862710000087232b75ac')
	})

})
